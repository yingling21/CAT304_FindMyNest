import React, { useState } from "react";
import {
  View,
  Text,
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
import { styles } from "@/styles/listing";

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
    <SafeAreaView style={styles.listingTabContainer} edges={["top"]}>
      <View style={styles.listingTabHeader}>
        <Text style={styles.listingTabHeaderTitle}>My Listings</Text>
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
