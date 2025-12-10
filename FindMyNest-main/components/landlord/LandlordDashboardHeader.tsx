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
    paddingTop: 20,
    paddingBottom: 32,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#C7D2FE",
  },
});
