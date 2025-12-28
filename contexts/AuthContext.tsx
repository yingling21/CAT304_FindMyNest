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
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // User doesn't exist in users table yet (not verified)
        // Try to load from AsyncStorage if available, but mark as unverified
        const pendingUserData = await AsyncStorage.getItem(`pending_user_${userId}`);
        if (pendingUserData) {
          const pendingUser = JSON.parse(pendingUserData);
          setUser({ ...pendingUser, verificationStatus: "unverified" as VerificationStatus });
        } else {
          setUser(null);
        }
        return;
      }
      
      if (data) {
        // Map database snake_case to TypeScript camelCase
        const mappedUser: User = {
          id: data.id,
          email: data.email || "",
          fullName: data.full_name || "",
          phoneNumber: data.phone_number || "",
          role: data.role || "tenant",
          profilePicture: data.profile_picture || undefined,
          verificationStatus: data.verification_status || "pending",
          identityDocument: data.identity_document || undefined,
          ownershipDocument: data.ownership_document || undefined,
          createdAt: data.created_at || new Date().toISOString(),
        };
        setUser(mappedUser);
        // Clear pending user data if user now exists in database
        await AsyncStorage.removeItem(`pending_user_${userId}`);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      // Fallback to AsyncStorage if database query fails
      try {
        const pendingUserData = await AsyncStorage.getItem(`pending_user_${userId}`);
        if (pendingUserData) {
          const pendingUser = JSON.parse(pendingUserData);
          setUser({ ...pendingUser, verificationStatus: "unverified" as VerificationStatus });
        }
      } catch (storageError) {
        console.error("Failed to load from AsyncStorage:", storageError);
      }
    }
  };

  const reloadUserProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error("Failed to reload user profile:", error);
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
        // Check if user exists in users table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        if (userError && userError.code !== 'PGRST116') {
          // Error other than "not found" - log and continue
          console.error("Error checking user:", userError);
        }

        if (!userData) {
          // User doesn't exist in users table - try to load from AsyncStorage and create user row
          const pendingUserData = await AsyncStorage.getItem(`pending_user_${data.user.id}`);
          if (pendingUserData) {
            const pendingUser = JSON.parse(pendingUserData);
            // Try to create user row from AsyncStorage data
            try {
              const { error: createError } = await supabase
                .from("users")
                .insert({
                  id: pendingUser.id,
                  email: pendingUser.email,
                  full_name: pendingUser.fullName,
                  phone_number: pendingUser.phoneNumber,
                  role: pendingUser.role || "tenant",
                  verification_status: "pending",
                });

              if (createError && createError.code !== '23505') { // Ignore if already exists
                console.error("Failed to create user from AsyncStorage:", createError);
              }
            } catch (err) {
              console.error("Error creating user from AsyncStorage:", err);
            }
          } else {
            // No user data found - redirect to identity verification
            await supabase.auth.signOut();
            throw new Error("Account not found. Please complete registration and IC verification.");
          }
        }

        // Load user profile (will load from database or AsyncStorage)
        await loadUserProfile(data.user.id);
        
        // Check verification status and redirect accordingly
        const currentUser = user;
        if (currentUser?.verificationStatus === "pending" || currentUser?.verificationStatus === "unverified") {
          // User exists but not verified - redirect to verification
          router.replace("/identity-verification");
        } else {
          // User is verified - proceed to home
          router.replace("/(tabs)/home");
        }
      }
    } catch (error: any) {
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
        data: { user, session },
        error,
      } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
          },
        },
      });
      
      if (error) {
        console.error("Supabase signup error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        throw error;
      }

      // Note: If email confirmation is required, user might be null initially
      // but we should still proceed if there's no error
      const userId = user?.id || session?.user?.id;
      
      if (userId) {
        // Create user row in users table immediately with email and phone number
        // Verification status will be "pending" until IC verification is completed
        try {
          const { data: createdUser, error: createError } = await supabase
            .from("users")
            .insert({
              id: userId,
              email: email.trim(),
              full_name: fullName.trim(),
              phone_number: phoneNumber.trim(),
              role: "tenant", // Default role, will be updated in role selection
              verification_status: "pending",
            })
            .select()
            .single();

          if (createError) {
            // If user already exists (e.g., from a previous attempt), update it
            if (createError.code === '23505') { // Unique violation
              console.log("User already exists, updating...");
              const { data: updatedUser, error: updateError } = await supabase
                .from("users")
                .update({
                  email: email.trim(),
                  full_name: fullName.trim(),
                  phone_number: phoneNumber.trim(),
                })
                .eq("id", userId)
                .select()
                .single();

              if (updateError) {
                console.error("Failed to update existing user:", updateError);
                throw updateError;
              }

              // Map database fields to frontend User type
              const mappedUser: User = {
                id: updatedUser.id,
                email: updatedUser.email || email,
                fullName: updatedUser.full_name || fullName,
                phoneNumber: updatedUser.phone_number || phoneNumber,
                role: (updatedUser.role || "tenant") as UserRole,
                verificationStatus: (updatedUser.verification_status || "pending") as VerificationStatus,
                createdAt: updatedUser.created_at || new Date().toISOString(),
              };
              
              setUser(mappedUser);
              router.replace("/role-selection");
              return;
            } else {
              console.error("Failed to create user in database:", createError);
              throw createError;
            }
          }

          if (createdUser) {
            // Map database fields to frontend User type
            const mappedUser: User = {
              id: createdUser.id,
              email: createdUser.email || email,
              fullName: createdUser.full_name || fullName,
              phoneNumber: createdUser.phone_number || phoneNumber,
              role: (createdUser.role || "tenant") as UserRole,
              verificationStatus: (createdUser.verification_status || "pending") as VerificationStatus,
              createdAt: createdUser.created_at || new Date().toISOString(),
            };
            
            setUser(mappedUser);
            router.replace("/role-selection");
            return;
          }
        } catch (dbError: any) {
          console.error("Database error during signup:", dbError);
          // Continue with AsyncStorage fallback if database insert fails
          console.warn("Falling back to AsyncStorage for user data");
        }

        // Fallback: Store user info temporarily in AsyncStorage if database insert fails
        const pendingUser: User = {
          id: userId,
          email: email,
          fullName: fullName,
          phoneNumber: phoneNumber,
          role: "tenant" as UserRole,
          verificationStatus: "pending" as VerificationStatus,
          createdAt: new Date().toISOString(),
        };
        
        await AsyncStorage.setItem(
          `pending_user_${userId}`,
          JSON.stringify(pendingUser)
        );
        
        setUser(pendingUser);
        router.replace("/role-selection");
      } else {
        // No user and no session - this shouldn't happen if signup succeeded
        throw new Error("Account created but unable to proceed. Please check your email for confirmation.");
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
    reloadUserProfile,
  };
});
