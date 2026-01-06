import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AdminDashboardHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.greeting}>Welcome back, Admin!</Text>
      <Text style={styles.subtitle}>Manage administration duty here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
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