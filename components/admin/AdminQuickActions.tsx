import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { ChevronRight, UserRoundPen, HousePlus, Trash2, Ban } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function AdminQuickActions() {
  const router = useRouter();

  return (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsList}>
        <Pressable 
          style={styles.actionCard}
          onPress={() => router.push("/PendingLandlords")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#EEF2FF" }]}>
            <UserRoundPen size={24} color="#6366F1" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Approve Pending Landlords</Text>
            <Text style={styles.actionSubtitle}>View and manage pending landlords registration</Text>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </Pressable>

        <Pressable 
          style={styles.actionCard}
          onPress={() => router.push("/PendingListings")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#EEF2FF" }]}>
            <HousePlus size={24} color="#6366F1" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Approve Pending Listings</Text>
            <Text style={styles.actionSubtitle}>View and manage pending property listings</Text>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </Pressable>

        <Pressable 
          style={styles.actionCard}
          onPress={() => router.push("/RemoveListing")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#EEF2FF" }]}>
            <Trash2 size={24} color="#6366F1" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Remove Listings</Text>
            <Text style={styles.actionSubtitle}>Remove existing property listings</Text>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </Pressable>

        <Pressable 
          style={styles.actionCard}
          onPress={() => router.push("/BanUser")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#EEF2FF" }]}>
            <Ban size={24} color="#6366F1" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Ban Users</Text>
            <Text style={styles.actionSubtitle}>Ban or unban users from the platform</Text>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quickActionsSection: {
    paddingHorizontal: 24,
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 16,
  },
  actionsList: {
    gap: 12,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionCardPrimary: {
    backgroundColor: "#6366F1",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
});
