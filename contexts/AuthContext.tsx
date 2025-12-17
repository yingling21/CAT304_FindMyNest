import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import type { User, UserRole, VerificationStatus } from "@/types";

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const [storedUser, storedOnboarding] = await Promise.all([
        AsyncStorage.getItem("user"),
        AsyncStorage.getItem("hasCompletedOnboarding"),
      ]);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedOnboarding) {
        setHasCompletedOnboarding(JSON.parse(storedOnboarding));
      }
    } catch (error) {
      console.error("Failed to load auth state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasCompletedOnboarding", JSON.stringify(true));
      setHasCompletedOnboarding(true);
      router.replace("/login");
    } catch (error) {
      console.error("Failed to save onboarding state:", error);
    }
  };

  const skipOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasCompletedOnboarding", JSON.stringify(true));
      setHasCompletedOnboarding(true);
      router.replace("/login");
    } catch (error) {
      console.error("Failed to save onboarding state:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const existingUserData = await AsyncStorage.getItem("user");
      if (existingUserData) {
        const existingUser: User = JSON.parse(existingUserData);
        setUser(existingUser);
        router.replace("/(tabs)/home");
      } else {
        const newUser: User = {
          id: Date.now().toString(),
          email,
          fullName: "Demo User",
          phoneNumber: "",
          role: "tenant",
          verificationStatus: "approved",
          createdAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
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
      const newUser: User = {
        id: Date.now().toString(),
        email,
        fullName,
        phoneNumber,
        role: "tenant",
        verificationStatus: "pending",
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      router.replace("/role-selection");
    } catch (error) {
      console.error("Failed to sign up:", error);
      throw error;
    }
  };

  const updateUserRole = async (role: UserRole) => {
    if (!user) return;
    try {
      const updatedUser = { ...user, role };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      router.replace("/identity-verification");
    } catch (error) {
      console.error("Failed to update role:", error);
      throw error;
    }
  };

  const completeVerification = async (identityDoc?: string, ownershipDoc?: string) => {
    if (!user) return;
    try {
      const updatedUser = {
        ...user,
        identityDocument: identityDoc,
        ownershipDocument: ownershipDoc,
        verificationStatus: "pending" as VerificationStatus,
      };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Failed to complete verification:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem("user");
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
