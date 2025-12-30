import { useAuth } from "@/contexts/AuthContext";
import { Link } from "expo-router";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { signupStyles as styles } from "@/styles/auth";

export default function SignUpScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"tenant" | "landlord" | null>(null);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!fullName || !email || !phoneNumber || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    // Validate phone number (basic check)
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(phoneNumber) || phoneNumber.replace(/\D/g, '').length < 8) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    if (!selectedRole) {
      Alert.alert("Error", "Please select whether you want to register as a tenant or landlord");
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password, fullName, phoneNumber, selectedRole);
    } catch (error: any) {
      console.error("Signup error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      // Extract more detailed error message
      let errorMessage = "Failed to create account. Please try again.";
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error_description) {
        errorMessage = error.error_description;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    Alert.alert("Coming Soon", "Google Sign Up will be available soon!");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>🏠</Text>
            </View>
          </View>
          <Text style={styles.logoText}>FindMyNest</Text>
        </View>

        <Text style={styles.heading}>Create account</Text>

        <View style={styles.formContainer}>
          <Pressable style={styles.googleButton} onPress={handleGoogleSignUp}>
            <View style={styles.googleIconContainer}>
              <Text style={styles.googleIcon}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </Pressable>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or create account manually</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your full name"
                placeholderTextColor="#D1D5DB"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor="#D1D5DB"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="+60123456789 or 0123456789"
                placeholderTextColor="#D1D5DB"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>
            <Text style={styles.hint}>Malaysian phone number</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor="#D1D5DB"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>I want to register as</Text>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <Pressable
                style={[
                  {
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: selectedRole === "tenant" ? "#6366F1" : "#E5E7EB",
                    backgroundColor: selectedRole === "tenant" ? "#EEF2FF" : "#FFFFFF",
                    alignItems: "center",
                  },
                ]}
                onPress={() => setSelectedRole("tenant")}
              >
                <Text style={{ fontSize: 16, fontWeight: "600", color: selectedRole === "tenant" ? "#6366F1" : "#6B7280" }}>
                  Tenant
                </Text>
                <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                  Looking for a home
                </Text>
              </Pressable>
              <Pressable
                style={[
                  {
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: selectedRole === "landlord" ? "#10B981" : "#E5E7EB",
                    backgroundColor: selectedRole === "landlord" ? "#D1FAE5" : "#FFFFFF",
                    alignItems: "center",
                  },
                ]}
                onPress={() => setSelectedRole("landlord")}
              >
                <Text style={{ fontSize: 16, fontWeight: "600", color: selectedRole === "landlord" ? "#10B981" : "#6B7280" }}>
                  Landlord
                </Text>
                <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                  List properties
                </Text>
              </Pressable>
            </View>
            <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 8 }}>
              You can register both roles with the same email. Use the same password for both, or different passwords - your choice. When signing in, use the password you set for the selected role.
            </Text>
          </View>

          <Pressable
            style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.signUpButtonText}>Create Account</Text>
            )}
          </Pressable>

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <Link href="/login" asChild>
              <Pressable>
                <Text style={styles.signInLink}>Sign In</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

