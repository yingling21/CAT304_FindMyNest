import { useAuth } from "@/contexts/AuthContext";
import { Building2, Home } from "lucide-react-native";
import React from "react";
import {
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { roleSelectionStyles as styles } from "@/styles/auth";

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
