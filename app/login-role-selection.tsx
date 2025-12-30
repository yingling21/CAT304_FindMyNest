import { useAuth } from "@/contexts/AuthContext";
import { Building2, Home } from "lucide-react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  Text,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { roleSelectionStyles as styles } from "@/styles/auth";

export default function LoginRoleSelectionScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [tenantVerified, setTenantVerified] = useState<boolean>(false);
  const [landlordVerified, setLandlordVerified] = useState<boolean>(false);

  useEffect(() => {
    // Load stored email, password, and verification statuses
    const loadCredentials = async () => {
      const storedEmail = await AsyncStorage.getItem("pending_login_email");
      const storedPassword = await AsyncStorage.getItem("pending_login_password");
      const storedTenantVerified = await AsyncStorage.getItem("pending_login_tenant_verified");
      const storedLandlordVerified = await AsyncStorage.getItem("pending_login_landlord_verified");
      
      if (storedEmail) setEmail(storedEmail);
      if (storedPassword) setPassword(storedPassword);
      if (storedTenantVerified) setTenantVerified(JSON.parse(storedTenantVerified) === true);
      if (storedLandlordVerified) setLandlordVerified(JSON.parse(storedLandlordVerified) === true);
    };
    loadCredentials();
  }, []);

  const handleRoleSelection = async (role: "tenant" | "landlord") => {
    if (!email || !password) {
      Alert.alert("Error", "Missing credentials. Please try logging in again.");
      router.replace("/login");
      return;
    }

    setIsLoading(true);
    try {
      console.log(`[LoginRoleSelection] Attempting login as ${role}`);
      console.log(`  Email: ${email}`);
      
      // Sign in with selected role (don't clear credentials yet in case of error)
      await signIn(email, password, role);
      
      // Only clear credentials on success
      await AsyncStorage.removeItem("pending_login_email");
      await AsyncStorage.removeItem("pending_login_password");
      await AsyncStorage.removeItem("pending_login_tenant_verified");
      await AsyncStorage.removeItem("pending_login_landlord_verified");
    } catch (error: any) {
      console.error(`[LoginRoleSelection] Login error for ${role}:`, error);
      console.error(`  Full error:`, JSON.stringify(error, null, 2));
      
      let errorMessage = error?.message || "Failed to sign in. Please try again.";
      
      // Provide more specific error message
      if (errorMessage.includes("Invalid credentials") || errorMessage.includes("Invalid login")) {
        errorMessage = `Invalid password for ${role} account. Please use the exact same password you used when registering as ${role}. If you registered both accounts with the same password, use that password.`;
      }
      
      Alert.alert(
        "Login Failed",
        errorMessage
      );
      // Don't redirect - let user try again or go back
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Select Account Type</Text>
          <Text style={styles.subtitle}>
            You have accounts registered as both tenant and landlord. Which account would you like to sign in to?
          </Text>
          {!tenantVerified && !landlordVerified && (
            <Text style={{ fontSize: 13, color: "#F59E0B", marginTop: 12, textAlign: "center", paddingHorizontal: 20, fontWeight: "600" }}>
              ⚠️ Both accounts require IC verification. Please select which account you want to continue/finish the IC verification process for.
            </Text>
          )}
          {(tenantVerified || landlordVerified) && (
            <Text style={{ fontSize: 13, color: "#6366F1", marginTop: 12, textAlign: "center", paddingHorizontal: 20 }}>
              ℹ️ Use the same password you used when registering. Select which account you want to access.
            </Text>
          )}
        </View>

        <View style={styles.optionsContainer}>
          <Pressable
            style={[styles.optionCard, isLoading && { opacity: 0.6 }]}
            onPress={() => handleRoleSelection("tenant")}
            disabled={isLoading}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#EEF2FF" }]}>
              <Home size={40} color="#6366F1" />
            </View>
            <Text style={styles.optionTitle}>Sign in as Tenant</Text>
            <Text style={styles.optionSubtitle}>
              {tenantVerified 
                ? "Access your tenant account to search for properties and manage rentals"
                : "Continue/finish IC verification for your tenant account"}
            </Text>
            {!tenantVerified && (
              <Text style={{ fontSize: 12, color: "#F59E0B", marginTop: 8, textAlign: "center", fontWeight: "600" }}>
                ⚠️ IC verification required - You will be redirected to complete verification
              </Text>
            )}
            {tenantVerified && (
              <Text style={{ fontSize: 12, color: "#10B981", marginTop: 8, textAlign: "center" }}>
                ✅ Verified - Ready to use
              </Text>
            )}
            {isLoading && (
              <ActivityIndicator color="#6366F1" style={{ marginTop: 12 }} />
            )}
          </Pressable>

          <Pressable
            style={[styles.optionCard, isLoading && { opacity: 0.6 }]}
            onPress={() => handleRoleSelection("landlord")}
            disabled={isLoading}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#D1FAE5" }]}>
              <Building2 size={40} color="#10B981" />
            </View>
            <Text style={styles.optionTitle}>Sign in as Landlord</Text>
            <Text style={styles.optionSubtitle}>
              {landlordVerified 
                ? "Access your landlord account to manage properties and tenants"
                : "Continue/finish IC verification for your landlord account"}
            </Text>
            {!landlordVerified && (
              <Text style={{ fontSize: 12, color: "#F59E0B", marginTop: 8, textAlign: "center", fontWeight: "600" }}>
                ⚠️ IC verification required - You will be redirected to complete verification
              </Text>
            )}
            {landlordVerified && (
              <Text style={{ fontSize: 12, color: "#10B981", marginTop: 8, textAlign: "center" }}>
                ✅ Verified - Ready to use
              </Text>
            )}
            {isLoading && (
              <ActivityIndicator color="#10B981" style={{ marginTop: 12 }} />
            )}
          </Pressable>
        </View>

        <Pressable
          style={{ marginTop: 24, padding: 16 }}
          onPress={() => {
            AsyncStorage.removeItem("pending_login_email");
            AsyncStorage.removeItem("pending_login_password");
            AsyncStorage.removeItem("pending_login_tenant_verified");
            AsyncStorage.removeItem("pending_login_landlord_verified");
            router.replace("/login");
          }}
          disabled={isLoading}
        >
          <Text style={{ textAlign: "center", color: "#6366F1", fontSize: 16, fontWeight: "600" }}>
            Back to Login
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

