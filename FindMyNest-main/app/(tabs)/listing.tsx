import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, Building2 } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useListing } from "@/contexts/ListingContext";
import ListingCard from "@/components/landlord/ListingCard";
import ListingStatusFilter from "@/components/landlord/ListingStatusFilter";

type ListingStatus = "all" | "approved" | "pending" | "rejected";

type ListingProperty = {
  id: string;
  landlordId: string;
  title: string;
  image: string;
  price: number;
  address: string;
  status: "approved" | "pending" | "rejected";
  views: number;
  messages: number;
  createdAt: string;
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  filterButtonActive: {
    backgroundColor: "#6366F1",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6366F1",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  listContainer: {
    padding: 16,
  },
  propertyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  propertyImage: {
    width: "100%",
    height: 180,
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusBadgeApproved: {
    backgroundColor: "rgba(16, 185, 129, 0.9)",
  },
  statusBadgePending: {
    backgroundColor: "rgba(251, 146, 60, 0.9)",
  },
  statusBadgeRejected: {
    backgroundColor: "rgba(239, 68, 68, 0.9)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  propertyInfo: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#6366F1",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  actionButtonPrimary: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
});

export default function ListingScreen() {
  const [selectedStatus, setSelectedStatus] = useState<ListingStatus>("all");
  const router = useRouter();
  const { user } = useAuth();
  const { getListingsByLandlord } = useListing();

  const userListings = user?.id ? getListingsByLandlord(user.id) : [];

  const convertedListings: ListingProperty[] = userListings.map((listing) => ({
    id: listing.id,
    landlordId: listing.landlordId,
    title: listing.title,
    image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400",
    price: listing.price,
    address: listing.address,
    status: listing.status,
    views: listing.views,
    messages: listing.messages,
    createdAt: listing.createdAt,
  }));

  const filteredListings = convertedListings.filter((listing) => {
    if (selectedStatus === "all") return true;
    return listing.status === selectedStatus;
  });

  const statusCounts = {
    all: convertedListings.length,
    approved: convertedListings.filter((l) => l.status === "approved").length,
    pending: convertedListings.filter((l) => l.status === "pending").length,
    rejected: convertedListings.filter((l) => l.status === "rejected").length,
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Listings</Text>
        <ListingStatusFilter
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          counts={statusCounts}
        />
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/add-listing")}
      >
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add New Listing</Text>
      </TouchableOpacity>

      <ScrollView style={styles.listContainer}>
        {filteredListings.length > 0 ? (
          filteredListings.map((property) => (
            <ListingCard key={property.id} property={property} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Building2 size={64} color="#D1D5DB" style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>
              No {selectedStatus === "all" ? "" : selectedStatus} listings
            </Text>
            <Text style={styles.emptyDescription}>
              {selectedStatus === "all"
                ? "Start by creating your first property listing"
                : `You don't have any ${selectedStatus} listings yet`}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
