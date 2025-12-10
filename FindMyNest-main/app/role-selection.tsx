import { useAuth } from "@/contexts/AuthContext";
import { Building2, Home } from "lucide-react-native";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RoleSelectionScreen() {
  const { user, updateUserRole } = useAuth();

  const handleRoleSelection = (role: "tenant" | "landlord") => {
    updateUserRole(role);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome, {user?.fullName}! 👋</Text>
          <Text style={styles.subtitle}>Let us know how you&apos;ll be using FindMyNest</Text>
        </View>

        <View style={styles.optionsContainer}>
          <Pressable
            style={styles.optionCard}
            onPress={() => handleRoleSelection("tenant")}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#EEF2FF" }]}>
              <Home size={40} color="#6366F1" />
            </View>
            <Text style={styles.optionTitle}>I&apos;m looking for a home</Text>
            <Text style={styles.optionSubtitle}>
              Search for properties, chat with landlords, and find your perfect rental
            </Text>
          </Pressable>

          <Pressable
            style={styles.optionCard}
            onPress={() => handleRoleSelection("landlord")}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#D1FAE5" }]}>
              <Building2 size={40} color="#10B981" />
            </View>
            <Text style={styles.optionTitle}>I&apos;m a landlord</Text>
            <Text style={styles.optionSubtitle}>
              List your properties, manage tenants, and find reliable renters
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 48,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 20,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    padding: 28,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  optionSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
});
