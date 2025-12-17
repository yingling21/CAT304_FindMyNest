import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Building2, Plus, MessageSquare, Wallet, User, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function LandlordQuickActions() {
  const router = useRouter();

  return (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsList}>
        <Pressable 
          style={styles.actionCard}
          onPress={() => router.push("/(tabs)/listing")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#EEF2FF" }]}>
            <Building2 size={24} color="#6366F1" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>My Listings</Text>
            <Text style={styles.actionSubtitle}>View and manage your properties</Text>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </Pressable>

        <Pressable 
          style={[styles.actionCard, styles.actionCardPrimary]}
          onPress={() => router.push("/add-listing")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#818CF8" }]}>
            <Plus size={24} color="#FFFFFF" />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: "#FFFFFF" }]}>Add New Listing</Text>
            <Text style={[styles.actionSubtitle, { color: "#C7D2FE" }]}>List a new property</Text>
          </View>
          <ChevronRight size={20} color="#FFFFFF" />
        </Pressable>

        <Pressable 
          style={styles.actionCard}
          onPress={() => router.push("/(tabs)/messages")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#DBEAFE" }]}>
            <MessageSquare size={24} color="#3B82F6" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Messages</Text>
            <Text style={styles.actionSubtitle}>Chat with potential tenants</Text>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </Pressable>

        <Pressable 
          style={styles.actionCard}
          onPress={() => router.push("/landlord-rentals" as any)}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#D1FAE5" }]}>
            <Wallet size={24} color="#10B981" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>My Rentals</Text>
            <Text style={styles.actionSubtitle}>View tenants and payments</Text>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </Pressable>

        <Pressable 
          style={styles.actionCard}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#F3F4F6" }]}>
            <User size={24} color="#6B7280" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>My Profile</Text>
            <Text style={styles.actionSubtitle}>Edit your profile information</Text>
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
