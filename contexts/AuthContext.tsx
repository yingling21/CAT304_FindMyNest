import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import type { User, UserRole, VerificationStatus } from "@/src/types";
import { supabase } from "../lib/supabase";
import { getUserById, updateUserRole as updateUserRoleAPI, updateUserVerification } from "@/src/api/users";
import { AppState } from "react-native";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // useEffect(() => {
  //   loadAuthState();
  // }, []);

  useEffect(() => {
    loadAuthState();
    // Listen for supabase auth changes
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(event, session);
      if (event === "INITIAL_SESSION") {
        // handle initial session
        loadAuthState();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAuthState = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }

      const storedOnboarding = await AsyncStorage.getItem(
        "hasCompletedOnboarding"
      );
      if (storedOnboarding) {
        setHasCompletedOnboarding(JSON.parse(storedOnboarding));
      }
    } catch (error) {
      console.error("Failed to load auth state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const userData = await getUserById(userId);
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(
        "hasCompletedOnboarding",
        JSON.stringify(true)
      );
      setHasCompletedOnboarding(true);
      router.replace("/login");
    } catch (error) {
      console.error("Failed to save onboarding state:", error);
    }
  };

  const skipOnboarding = async () => {
    try {
      await AsyncStorage.setItem(
        "hasCompletedOnboarding",
        JSON.stringify(true)
      );
      setHasCompletedOnboarding(true);
      router.replace("/login");
    } catch (error) {
      console.error("Failed to save onboarding state:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      if (data.user) {
        await loadUserProfile(data.user.id);
        router.replace("/(tabs)/home");
      }
    } catch (error) {
      console.error("Failed to sign in:", error);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phoneNumber: string
  ) => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.signUp({
        email: email,
        password: password,
      });
      if (error) throw error;

      if (user) {
        const { error } = await supabase
          .from("users")
          .update({
            email: email,
            full_name: fullName,
            phone_number: phoneNumber,
            role: "tenant",
            verification_status: "pending",
          })
          .eq("id", user.id);
        if (error) throw error;

        const newUser: User = {
          id: user.id,
          email: email,
          fullName: fullName,
          phoneNumber: phoneNumber,
          role: "tenant" as UserRole,
          verificationStatus: "pending" as VerificationStatus,
          createdAt: new Date().toISOString(),
        };
        setUser(newUser);
        router.replace("/role-selection");
      }
    } catch (error) {
      console.error("Failed to sign up:", error);
      throw error;
    }
  };

  const updateUserRole = async (role: string) => {
    if (!user) return;
    try {
      await updateUserRoleAPI(user.id, role as UserRole);

      const updatedUser = { ...user, role: role as UserRole };
      setUser(updatedUser);
      router.replace("/identity-verification");
    } catch (error) {
      console.error("Failed to update role:", error);
      throw error;
    }
  };

  const completeVerification = async (
    identityDoc?: string,
    ownershipDoc?: string
  ) => {
    if (!user) return;
    try {
      await updateUserVerification(user.id, {
        identityDocument: identityDoc,
        ownershipDocument: ownershipDoc,
        verificationStatus: "pending",
      });

      const updatedUser = {
        ...user,
        identityDocument: identityDoc,
        ownershipDocument: ownershipDoc,
        verificationStatus: "pending" as VerificationStatus,
      };
      setUser(updatedUser);
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Failed to complete verification:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      router.replace("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return {
    user,
    hasCompletedOnboarding,
    isLoading,
    completeOnboarding,
    skipOnboarding,
    signIn,
    signUp,
    signOut,
    updateUserRole,
    completeVerification,
  };
});
