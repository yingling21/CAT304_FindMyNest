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

  const signIn = async (email: string, password: string, role?: "tenant" | "landlord") => {
    try {
      // Check which roles exist for this email
      const { data: existingUsers, error: checkError } = await supabase
        .from("users")
        .select("role, id")
        .eq("email", email.trim());

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing users:", checkError);
      }

      console.log(`[SignIn] Found users for email ${email}:`, existingUsers);

      const availableRoles = existingUsers?.map(u => u.role) || [];
      const hasTenant = availableRoles.includes("tenant");
      const hasLandlord = availableRoles.includes("landlord");
      
      console.log(`[SignIn] Available roles: tenant=${hasTenant}, landlord=${hasLandlord}, requested role=${role || "auto"}`);

      // If both roles exist and no role specified, we need role selection
      if (hasTenant && hasLandlord && !role) {
        // Store email and password temporarily for role selection
        await AsyncStorage.setItem("pending_login_email", email);
        await AsyncStorage.setItem("pending_login_password", password);
        router.replace("/login-role-selection");
        return;
      }

      // If role is provided or only one role exists, proceed with login
      let selectedRole = role;
      if (!selectedRole) {
        // Auto-select the only available role
        if (hasTenant && !hasLandlord) {
          selectedRole = "tenant";
        } else if (hasLandlord && !hasTenant) {
          selectedRole = "landlord";
        } else {
          // Default to tenant if somehow both don't exist
          selectedRole = "tenant";
        }
      }

      // Use email+role format for authentication
      const [emailLocal, emailDomain] = email.split("@");
      if (!emailLocal || !emailDomain) {
        throw new Error("Invalid email format");
      }
      const authEmail = `${emailLocal}+${selectedRole}@${emailDomain}`;

      console.log(`[SignIn] Attempting login with:`);
      console.log(`  Original email: ${email}`);
      console.log(`  Selected role: ${selectedRole}`);
      console.log(`  Auth email: ${authEmail}`);

      // First, check if the Auth account exists by trying to get user info
      // This helps debug if the account was created properly
      console.log(`[SignIn] Checking if Auth account exists for ${authEmail}...`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: password,
      });

      if (error) {
        console.error(`[SignIn] Login failed:`);
        console.error(`  Auth email used: ${authEmail}`);
        console.error(`  Error code: ${error.status || error.code}`);
        console.error(`  Error message: ${error.message}`);
        console.error(`  Full error object:`, JSON.stringify(error, null, 2));
        
        // Check if account doesn't exist
        if (error.message?.includes("Invalid login credentials")) {
          // Try to check if account exists by attempting to reset password (this will fail if account doesn't exist)
          console.log(`[SignIn] Account might not exist. Checking...`);
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(authEmail, {
            redirectTo: 'dummy', // We don't actually want to reset, just check if account exists
          });
          
          if (resetError && resetError.message?.includes("not found") || resetError.message?.includes("does not exist")) {
            throw new Error(`The ${selectedRole} account does not exist. It may not have been created properly during registration. Please try registering again as ${selectedRole}.`);
          }
          
          throw new Error(`Invalid password for ${selectedRole} account. Please use the exact same password you used when registering as ${selectedRole}. The password must match exactly what you set during registration.`);
        }
        
        if (error.message?.includes("Email not confirmed")) {
          throw new Error(`Email not confirmed for ${selectedRole} account. Please check your email and confirm your account before signing in.`);
        }
        
        throw error;
      }

      if (data.user) {
        console.log(`[SignIn] Successfully authenticated with Supabase Auth`);
        console.log(`[SignIn] User ID: ${data.user.id}`);
        console.log(`[SignIn] Auth email: ${data.user.email}`);
        console.log(`[SignIn] Expected role: ${selectedRole}`);
        
        // Check if user exists in users table - match by ID
        // Note: Each Supabase Auth account has unique ID, so this should match exactly one record
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        console.log(`[SignIn] User data from database:`, userData ? {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          full_name: userData.full_name
        } : "NOT FOUND");

        if (userError && userError.code !== 'PGRST116') {
          // Error other than "not found" - log and continue
          console.error("[SignIn] Error checking user:", userError);
        }
        
        // Verify the role matches what we expect
        if (userData && userData.role !== selectedRole) {
          console.error(`[SignIn] ROLE MISMATCH! Database has role="${userData.role}" but expected "${selectedRole}"`);
          console.error(`[SignIn] This might indicate a data inconsistency. Auth user ID: ${data.user.id}`);
        }

        if (!userData) {
          console.warn(`[SignIn] User not found in database by ID ${data.user.id}, trying to find by email+role...`);
          
          // Fallback: Try to find user by email and role (in case ID mismatch)
          const [emailLocal, emailDomain] = email.split("@");
          const { data: fallbackUserData, error: fallbackError } = await supabase
            .from("users")
            .select("*")
            .eq("email", email.trim())
            .eq("role", selectedRole)
            .maybeSingle();
          
          if (fallbackUserData) {
            console.log(`[SignIn] Found user by email+role, but ID mismatch!`);
            console.log(`[SignIn] Auth ID: ${data.user.id}, Database ID: ${fallbackUserData.id}`);
            console.warn(`[SignIn] Attempting to fix ID mismatch by updating database record...`);
            
            // Try to update the database record to use the correct Auth ID
            const { data: updatedUser, error: updateError } = await supabase
              .from("users")
              .update({ id: data.user.id })
              .eq("email", email.trim())
              .eq("role", selectedRole)
              .select()
              .single();
            
            if (updateError || !updatedUser) {
              console.error(`[SignIn] Failed to update user ID:`, updateError);
              // If update fails, try to delete old record and create new one
              await supabase
                .from("users")
                .delete()
                .eq("id", fallbackUserData.id);
              
              // Create new record with correct ID
              const { error: createError } = await supabase
                .from("users")
                .insert({
                  id: data.user.id,
                  email: fallbackUserData.email,
                  full_name: fallbackUserData.full_name,
                  phone_number: fallbackUserData.phone_number,
                  role: fallbackUserData.role,
                  verification_status: fallbackUserData.verification_status,
                  profile_picture: fallbackUserData.profile_picture,
                  identity_document: fallbackUserData.identity_document,
                  ownership_document: fallbackUserData.ownership_document,
                  created_at: fallbackUserData.created_at,
                });
              
              if (createError) {
                console.error(`[SignIn] Failed to recreate user record:`, createError);
                await supabase.auth.signOut();
                throw new Error(`Account data mismatch. Please contact support.`);
              }
              
              // Reload user data
              const { data: newUserData } = await supabase
                .from("users")
                .select("*")
                .eq("id", data.user.id)
                .single();
              
              if (newUserData) {
                console.log(`[SignIn] Successfully fixed ID mismatch!`);
                // Continue with login using newUserData
                const mappedUser: User = {
                  id: newUserData.id,
                  email: newUserData.email || "",
                  fullName: newUserData.full_name || "",
                  phoneNumber: newUserData.phone_number || "",
                  role: newUserData.role || "tenant",
                  profilePicture: newUserData.profile_picture || undefined,
                  verificationStatus: newUserData.verification_status || "pending",
                  identityDocument: newUserData.identity_document || undefined,
                  ownershipDocument: newUserData.ownership_document || undefined,
                  createdAt: newUserData.created_at || new Date().toISOString(),
                };
                setUser(mappedUser);
                
                if (mappedUser.verificationStatus === "pending" || mappedUser.verificationStatus === "unverified") {
                  router.replace("/identity-verification");
                } else {
                  router.replace("/(tabs)/home");
                }
                return;
              }
            } else {
              console.log(`[SignIn] Successfully updated user ID!`);
              // Use updatedUser and continue
              const mappedUser: User = {
                id: updatedUser.id,
                email: updatedUser.email || "",
                fullName: updatedUser.full_name || "",
                phoneNumber: updatedUser.phone_number || "",
                role: updatedUser.role || "tenant",
                profilePicture: updatedUser.profile_picture || undefined,
                verificationStatus: updatedUser.verification_status || "pending",
                identityDocument: updatedUser.identity_document || undefined,
                ownershipDocument: updatedUser.ownership_document || undefined,
                createdAt: updatedUser.created_at || new Date().toISOString(),
              };
              setUser(mappedUser);
              
              if (mappedUser.verificationStatus === "pending" || mappedUser.verificationStatus === "unverified") {
                router.replace("/identity-verification");
              } else {
                router.replace("/(tabs)/home");
              }
              return;
            }
          }
          
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
    phoneNumber: string,
    role: "tenant" | "landlord" = "tenant"
  ) => {
    try {
      // Check if email already exists with the same role
      const { data: existingUsers, error: checkError } = await supabase
        .from("users")
        .select("email, role")
        .eq("email", email.trim());

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing users:", checkError);
      }

      // Check if this email+role combination already exists
      if (existingUsers && existingUsers.some(u => u.role === role)) {
        throw new Error(`An account with this email already exists as a ${role}. Please use a different email or select the other role.`);
      }

      // If email exists with a different role, we can optionally verify password
      // But we'll skip verification to avoid session issues - just create the new account
      if (existingUsers && existingUsers.length > 0) {
        const otherRole = existingUsers[0].role; // Get the existing role
        console.log(`[SignUp] Email exists with role ${otherRole}`);
        console.log(`[SignUp] Creating ${role} account. You can use the same password or a different password.`);
        // Note: We skip password verification to avoid session conflicts
        // Each account will have its own password stored in Supabase Auth
      }

      // Ensure we're signed out before creating new account (in case of any lingering session)
      // This prevents session conflicts when creating the second account
      await supabase.auth.signOut();
      console.log(`[SignUp] Ensured clean session state before creating account`);

      // Use email+role as the auth identifier to allow same email with different roles
      // Format: "email+role@domain.com" -> "email+tenant@example.com"
      const [emailLocal, emailDomain] = email.split("@");
      const authEmail = `${emailLocal}+${role}@${emailDomain}`;

      console.log(`[SignUp] Creating Supabase Auth account:`);
      console.log(`  Auth email: ${authEmail}`);
      console.log(`  Role: ${role}`);
      console.log(`  Original email: ${email}`);

      const {
        data: { user, session },
        error,
      } = await supabase.auth.signUp({
        email: authEmail, // Use email+role for auth
        password: password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
            original_email: email, // Store original email
            role: role,
          },
        },
      });
      
      if (error) {
        console.error("[SignUp] Supabase signup error:", error);
        console.error("[SignUp] Error details:", JSON.stringify(error, null, 2));
        
        // Check if account already exists
        if (error.message?.includes("already registered") || error.message?.includes("already exists")) {
          throw new Error(`An account with email ${authEmail} already exists. Please try signing in instead.`);
        }
        throw error;
      }

      // Note: If email confirmation is required, user might be null initially
      // but we should still proceed if there's no error
      const userId = user?.id || session?.user?.id;
      
      if (!userId) {
        console.error("[SignUp] No user ID returned from signup!");
        console.error("[SignUp] User object:", user);
        console.error("[SignUp] Session object:", session);
        throw new Error("Failed to create account. Please try again.");
      }
      
      console.log(`[SignUp] Successfully created Supabase Auth account with ID: ${userId}`);
      
      if (userId) {
        // Create user row in users table immediately with email and phone number
        // Verification status will be "pending" until IC verification is completed
        try {
          const { data: createdUser, error: createError } = await supabase
            .from("users")
            .insert({
              id: userId,
              email: email.trim(), // Store original email (not email+role)
              full_name: fullName.trim(),
              phone_number: phoneNumber.trim(),
              role: role, // Use the selected role
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
                role: (updatedUser.role || role) as UserRole,
                verificationStatus: (updatedUser.verification_status || "pending") as VerificationStatus,
                createdAt: updatedUser.created_at || new Date().toISOString(),
              };
              
              setUser(mappedUser);
              router.replace("/identity-verification");
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
              role: (createdUser.role || role) as UserRole,
              verificationStatus: (createdUser.verification_status || "pending") as VerificationStatus,
              createdAt: createdUser.created_at || new Date().toISOString(),
            };
            
            setUser(mappedUser);
            router.replace("/identity-verification");
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
          role: role as UserRole,
          verificationStatus: "pending" as VerificationStatus,
          createdAt: new Date().toISOString(),
        };
        
        await AsyncStorage.setItem(
          `pending_user_${userId}`,
          JSON.stringify(pendingUser)
        );
        
        setUser(pendingUser);
        router.replace("/identity-verification");
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
