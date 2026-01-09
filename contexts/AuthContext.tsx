import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import type { User, UserRole, VerificationStatus } from "@/src/types";
import { supabase } from "../lib/supabase";
import { getUserById, updateUserRole as updateUserRoleAPI, updateUserVerification } from "@/src/api/users";
import { Alert, AppState } from "react-native";

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
        
        // Clear pending user data if user now exists in database
        await AsyncStorage.removeItem(`pending_user_${userId}`);
        return;
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
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

  const signIn = async (email: string, password: string, role?: "tenant" | "landlord" | "admin") => {
    try {
      // Check which roles exist for this email, including verification status
      const { data: existingUsers, error: checkError } = await supabase
        .from("users")
        .select("role, id, verification_status, is_banned")
        .eq("email", email.trim());

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing users:", checkError);
      }

      if (existingUsers?.some(u => u.is_banned)) {
        throw new Error("This account has been banned. Please contact support for more information.");
      }

      console.log(`[SignIn] Found users for email ${email}:`, existingUsers);

      const availableRoles = existingUsers?.map(u => u.role) || [];
      const hasTenant = availableRoles.includes("tenant");
      const hasLandlord = availableRoles.includes("landlord");
      const hasAdmin = availableRoles.includes("admin");
      
      // Get verification status for each role
      const tenantUser = existingUsers?.find(u => u.role === "tenant");
      const landlordUser = existingUsers?.find(u => u.role === "landlord");
      const tenantVerified = tenantUser?.verification_status === "approved";
      const landlordVerified = landlordUser?.verification_status === "approved";
      
      console.log(`[SignIn] Available roles: tenant=${hasTenant} (verified=${tenantVerified}), landlord=${hasLandlord} (verified=${landlordVerified}), requested role=${role || "auto"}`);

      // If both roles exist and no role specified, we need role selection
      if (hasTenant && hasLandlord && !role) {
        // Store email, password, and verification statuses for role selection
        await AsyncStorage.setItem("pending_login_email", email);
        await AsyncStorage.setItem("pending_login_password", password);
        await AsyncStorage.setItem("pending_login_tenant_verified", JSON.stringify(tenantVerified));
        await AsyncStorage.setItem("pending_login_landlord_verified", JSON.stringify(landlordVerified));
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
        } else if (hasAdmin) {
          selectedRole = "admin";
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
          
          if (resetError && (resetError.message?.includes("not found") || resetError.message?.includes("does not exist"))) {
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
          full_name: userData.full_name,
          verification_status: userData.verification_status
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
        
        // Check verification status immediately if userData exists
        // CRITICAL: Users CANNOT sign in until verification_status is "approved"
        // NULL, "pending", "rejected", "unverified" all require IC verification
        // If not approved, redirect to IC verification page (keep authenticated)
        // If approved, proceed directly to home page (skip IC verification)
        if (userData) {
          const verificationStatus = userData.verification_status;
          console.log(`[SignIn] User found in database. Verification status: "${verificationStatus}" (type: ${typeof verificationStatus}, is null: ${verificationStatus === null})`);
          
          // Check if verification_status is NULL, undefined, or not "approved"
          // NULL means user registered but never completed IC verification
          if (!verificationStatus || verificationStatus === null || verificationStatus !== "approved") {
            if(userData.role === "landlord"){
              console.log(`[SignIn] Landlord account detected, verification status is not approved. Need to wait for admin approval.`);
              Alert.alert(
                "Verification Required",
                "Your landlord account is pending admin approval. Please wait for confirmation before logging in.",
                [
                  {
                    text: "OK",
                    onPress: () => router.replace("/login"),
                  },
                ]
              );
              return;
            }
            const statusDisplay = verificationStatus === null ? "NULL (not verified)" : verificationStatus;
            console.log(`[SignIn] User verification status is "${statusDisplay}", not approved. Redirecting to IC verification.`);
            // Load user profile and keep authenticated so they can submit verification
            await loadUserProfile(data.user.id);
            router.replace("/identity-verification");
            // CRITICAL: Return early to prevent any further processing
            return;
          }
          
          // User is approved - map userData to User type and set it, then go to home
          console.log(`[SignIn] User verification status is "approved". Proceeding directly to home page.`);
          
          // Map userData to User type and set it directly
          const mappedUser: User = {
            id: userData.id,
            email: userData.email || "",
            fullName: userData.full_name || "",
            phoneNumber: userData.phone_number || "",
            role: userData.role || "tenant",
            verificationStatus: (userData.verification_status === null ? "pending" : userData.verification_status || "pending") as VerificationStatus,
            identityDocument: userData.identity_document || undefined,
            ownershipDocument: userData.ownership_document || undefined,
            createdAt: userData.created_at || new Date().toISOString(),
          };
          setUser(mappedUser);
          
          // Go directly to home page (no need to load profile again, we already have the data)
          if(userData.role === "admin") {
            router.replace("/(admin)/AdminHome");
            return
          } else {
          router.replace("/(tabs)/home");
          return;
          }
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
                  verificationStatus: (newUserData.verification_status === null ? "pending" : newUserData.verification_status || "pending") as VerificationStatus,
                  identityDocument: newUserData.identity_document || undefined,
                  ownershipDocument: newUserData.ownership_document || undefined,
                  createdAt: newUserData.created_at || new Date().toISOString(),
                };
                setUser(mappedUser);
                
                // Only allow sign-in if verification status is "approved"
                // Check if verification_status is NULL, undefined, or not "approved"
                if (!mappedUser.verificationStatus || mappedUser.verificationStatus === null || mappedUser.verificationStatus !== "approved") {
                  const statusDisplay = mappedUser.verificationStatus === null ? "NULL (not verified)" : mappedUser.verificationStatus || "undefined";
                  console.log(`[SignIn] User verification status is "${statusDisplay}", redirecting to IC verification.`);
                  router.replace("/identity-verification");
                  return;
                }
                
                // User is approved - proceed to home
                router.replace("/(tabs)/home");
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
                verificationStatus: (updatedUser.verification_status === null ? "pending" : updatedUser.verification_status || "pending") as VerificationStatus,
                identityDocument: updatedUser.identity_document || undefined,
                ownershipDocument: updatedUser.ownership_document || undefined,
                createdAt: updatedUser.created_at || new Date().toISOString(),
              };
              setUser(mappedUser);
              
              // Only allow sign-in if verification status is "approved"
              // Check if verification_status is NULL, undefined, or not "approved"
              if (!mappedUser.verificationStatus || mappedUser.verificationStatus === null || mappedUser.verificationStatus !== "approved") {
                const statusDisplay = mappedUser.verificationStatus === null ? "NULL (not verified)" : mappedUser.verificationStatus || "undefined";
                console.log(`[SignIn] User verification status is "${statusDisplay}", redirecting to IC verification.`);
                router.replace("/identity-verification");
                return;
              }
              
              // User is approved - proceed to home
              router.replace("/(tabs)/home");
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
                  role: pendingUser.role || selectedRole, // CRITICAL: Use the role from signup (AsyncStorage) or selectedRole from sign-in
                  verification_status: null, // Set to NULL when user hasn't done IC verification yet
                });

              if (createError && createError.code !== '23505') { // Ignore if already exists
                console.error("Failed to create user from AsyncStorage:", createError);
              } else {
                // User created successfully, now fetch it to check verification status
                const { data: newUserData } = await supabase
                  .from("users")
                  .select("*")
                  .eq("id", data.user.id)
                  .maybeSingle();
                
                if (newUserData) {
                  const mappedUser: User = {
                    id: newUserData.id,
                    email: newUserData.email || "",
                    fullName: newUserData.full_name || "",
                    phoneNumber: newUserData.phone_number || "",
                    role: newUserData.role || "tenant",
                    verificationStatus: (newUserData.verification_status === null ? "pending" : newUserData.verification_status || "pending") as VerificationStatus,
                    identityDocument: newUserData.identity_document || undefined,
                    ownershipDocument: newUserData.ownership_document || undefined,
                    createdAt: newUserData.created_at || new Date().toISOString(),
                  };
                  setUser(mappedUser);
                  
                  // Check if verification_status is NULL, undefined, or not "approved"
                  if (!mappedUser.verificationStatus || mappedUser.verificationStatus === null || mappedUser.verificationStatus !== "approved") {
                    const statusDisplay = mappedUser.verificationStatus === null ? "NULL (not verified)" : mappedUser.verificationStatus || "undefined";
                    console.log(`[SignIn] User verification status is "${statusDisplay}", redirecting to IC verification.`);
                    router.replace("/identity-verification");
                    return;
                  }
                  
                  router.replace("/(tabs)/home");
                  return;
                }
              }
            } catch (err) {
              console.error("Error creating user from AsyncStorage:", err);
            }
          }
          
          // No user data found in database or AsyncStorage - redirect to verification (keep authenticated)
          console.log(`[SignIn] User not found in database. Redirecting to IC verification to complete registration.`);
          // Try to load user profile (might create a basic user record)
          try {
            await loadUserProfile(data.user.id);
          } catch (profileError) {
            console.error("Error loading user profile:", profileError);
          }
          router.replace("/identity-verification");
          return;
        }

        // Load user profile (will load from database or AsyncStorage)
        await loadUserProfile(data.user.id);
        
        // Wait a moment for state to update, then check verification status
        // Use a small delay to ensure state has updated
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Double-check verification status after loading profile
        // Fetch directly from database to ensure we have the latest status
        const { data: latestUserData, error: latestUserError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();
        
        if (latestUserData) {
          const mappedUser: User = {
            id: latestUserData.id,
            email: latestUserData.email || "",
            fullName: latestUserData.full_name || "",
            phoneNumber: latestUserData.phone_number || "",
            role: latestUserData.role || "tenant",
            verificationStatus: (latestUserData.verification_status === null ? "pending" : latestUserData.verification_status || "pending") as VerificationStatus,
            identityDocument: latestUserData.identity_document || undefined,
            ownershipDocument: latestUserData.ownership_document || undefined,
            createdAt: latestUserData.created_at || new Date().toISOString(),
          };
          setUser(mappedUser);
          
          // Check if verification_status is NULL, undefined, or not "approved"
          if (!mappedUser.verificationStatus || mappedUser.verificationStatus === null || mappedUser.verificationStatus !== "approved") {
            const statusDisplay = mappedUser.verificationStatus === null ? "NULL (not verified)" : mappedUser.verificationStatus || "undefined";
            console.log(`[SignIn] User verification status is "${statusDisplay}", redirecting to IC verification.`);
            router.replace("/identity-verification");
            return;
          }
          
          console.log(`[SignIn] User is approved. Redirecting to home.`);
          router.replace("/(tabs)/home");
          return;
        }
        
        // User not found in database - redirect to verification (keep authenticated)
        console.log(`[SignIn] User profile not found in database. Redirecting to IC verification.`);
        router.replace("/identity-verification");
        return;
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
    phoneNumber: string,
    role: "tenant" | "landlord"
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

      // Use email+role as the auth identifier to allow same email with different roles
      // Format: "email+role@domain.com" -> "email+tenant@example.com"
      const [emailLocal, emailDomain] = email.split("@");
      const authEmail = `${emailLocal}+${role}@${emailDomain}`;

      console.log(`[SignUp] Creating Supabase Auth account:`);
      console.log(`  Auth email: ${authEmail}`);
      console.log(`  Role: ${role}`);
      console.log(`  Original email: ${email}`);

      // Ensure we're signed out before creating new account (in case of any lingering session)
      // This prevents session conflicts when creating the second account
      // But do it right before signup to minimize the gap
      await supabase.auth.signOut();
      console.log(`[SignUp] Ensured clean session state before creating account`);

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
            original_email: email, // Store original email in user metadata (not in users table)
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
        console.error("[SignUp] Error (if any):", error);
        
        // Check if email confirmation is required
        if (!user && !session && !error) {
          throw new Error("Account creation may require email confirmation. Please check your email and confirm your account, then try signing in.");
        }
        
        throw new Error("Failed to create account. Please try again.");
      }
      
      console.log(`[SignUp] Successfully created Supabase Auth account with ID: ${userId}`);
      console.log(`[SignUp] Session exists: ${!!session}`);
      console.log(`[SignUp] User object exists: ${!!user}`);
      
      // Verify we have a session - if not, try to get it
      let finalSession = session;
      if (!finalSession) {
        console.log(`[SignUp] No session after signup, attempting to get session...`);
        const { data: { session: newSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("[SignUp] Error getting session:", sessionError);
        } else if (newSession) {
          console.log(`[SignUp] Successfully retrieved session after signup`);
          finalSession = newSession;
        } else {
          console.warn(`[SignUp] No session available after signup. This might require email confirmation.`);
          // If no session, try to sign in with the credentials to establish session
          try {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: authEmail,
              password: password,
            });
            if (!signInError && signInData?.session) {
              console.log(`[SignUp] Successfully signed in after signup to establish session`);
              finalSession = signInData.session;
            }
          } catch (signInErr) {
            console.error("[SignUp] Failed to sign in after signup:", signInErr);
          }
        }
      }
      
      // Note: If email confirmation is required, session might not be available immediately
      // We'll still proceed with account creation and let the identity verification page handle auth
      if (!finalSession) {
        console.warn(`[SignUp] No session available after signup. This might require email confirmation.`);
        console.warn(`[SignUp] Proceeding with account creation - user can sign in later to complete verification.`);
        // Don't throw error - still proceed with creating database record
        // User will need to sign in to access identity verification
      }
      
      if (userId) {
        // Create user row in users table immediately with email, phone number, and role
        // CRITICAL: Role must be saved immediately during registration, even before IC verification
        // Verification status will be NULL (or "pending") until IC verification is completed
        // NULL means user registered but never completed IC verification
        try {
          const { data: createdUser, error: createError } = await supabase
            .from("users")
            .insert({
              id: userId,
              email: email.trim(), // Store original email (not email+role)
              full_name: fullName.trim(),
              phone_number: phoneNumber.trim(),
              role: role, // CRITICAL: Save the selected role immediately, even before IC verification
              verification_status: null, // Set to NULL when user hasn't done IC verification yet
            })
            .select()
            .single();

          if (createError) {
            // If user already exists (e.g., from a previous attempt), update it
            if (createError.code === '23505') { // Unique violation
              console.log("User already exists, updating...");
              // CRITICAL: Always update role to ensure it's saved even if user exists
              const { data: updatedUser, error: updateError } = await supabase
                .from("users")
                .update({
                  email: email.trim(),
                  full_name: fullName.trim(),
                  phone_number: phoneNumber.trim(),
                  role: role, // CRITICAL: Always save the role, even when updating existing user
                  // Don't update verification_status if it's already set (might be NULL or "pending")
                  // Only set to NULL if it doesn't exist yet
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
                verificationStatus: (updatedUser.verification_status === null ? "pending" : updatedUser.verification_status || "pending") as VerificationStatus,
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
              verificationStatus: (createdUser.verification_status === null ? "pending" : createdUser.verification_status || "pending") as VerificationStatus,
              createdAt: createdUser.created_at || new Date().toISOString(),
            };
            
            setUser(mappedUser);
            
            // If we have a session, go to identity verification
            // If not, redirect to login
            if (finalSession) {
              router.replace("/identity-verification");
            } else {
              console.log(`[SignUp] No session available, redirecting to login.`);
              await supabase.auth.signOut();
              router.replace("/login");
            }
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
        
        // If we have a session, go to identity verification
        // If not, redirect to login so user can sign in first
        if (finalSession) {
          router.replace("/identity-verification");
        } else {
          // No session - user needs to sign in first
          console.log(`[SignUp] No session available, redirecting to login. User should sign in to complete verification.`);
          await supabase.auth.signOut(); // Ensure clean state
          router.replace("/login");
        }
      } else {
        // No user ID - this shouldn't happen if signup succeeded
        throw new Error("Failed to create account. No user ID returned from signup.");
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
      if (error) {
        // If there's no active session, that's okay - user is already signed out
        // Only log other errors
        if (error.name !== 'AuthSessionMissingError') {
          console.error("Failed to sign out:", error);
        }
      }
    } catch (error: any) {
      // If there's no active session, that's okay - user is already signed out
      // Only log other errors
      if (error?.name !== 'AuthSessionMissingError') {
        console.error("Failed to sign out:", error);
      }
    } finally {
      // Always clear local state and navigate to login, regardless of signOut result
      setUser(null);
      router.replace("/login");
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