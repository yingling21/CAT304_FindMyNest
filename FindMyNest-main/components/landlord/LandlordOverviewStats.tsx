import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Building2, Home, Users, MessageSquare } from "lucide-react-native";

type Props = {
  totalListings: number;
  activeListings: number;
  totalTenants: number;
  unreadMessages: number;
};

export default function LandlordOverviewStats({ 
  totalListings, 
  activeListings, 
  totalTenants, 
  unreadMessages 
}: Props) {
  return (
    <View style={styles.overviewSection}>
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: "#EEF2FF" }]}>
          <View style={[styles.statIcon, { backgroundColor: "#C7D2FE" }]}>
            <Building2 size={24} color="#6366F1" />
          </View>
          <Text style={styles.statLabel}>Total Listings</Text>
          <Text style={styles.statValue}>{totalListings}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#D1FAE5" }]}>
          <View style={[styles.statIcon, { backgroundColor: "#A7F3D0" }]}>
            <Home size={24} color="#10B981" />
          </View>
          <Text style={styles.statLabel}>Active</Text>
          <Text style={styles.statValue}>{activeListings}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#FEF3C7" }]}>
          <View style={[styles.statIcon, { backgroundColor: "#FDE68A" }]}>
            <Users size={24} color="#F59E0B" />
          </View>
          <Text style={styles.statLabel}>Total Tenants</Text>
          <Text style={styles.statValue}>{totalTenants}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#DBEAFE" }]}>
          <View style={[styles.statIcon, { backgroundColor: "#BFDBFE" }]}>
            <MessageSquare size={24} color="#3B82F6" />
          </View>
          <Text style={styles.statLabel}>Messages</Text>
          <Text style={styles.statValue}>{unreadMessages}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overviewSection: {
    paddingHorizontal: 24,
    marginTop: -16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
});
