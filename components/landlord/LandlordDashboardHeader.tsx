import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function LandlordDashboardHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.greeting}>Welcome back, Landlord!</Text>
      <Text style={styles.subtitle}>Manage your properties and connect with tenants</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#C7D2FE",
  },
});
