import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";

export default function PendingListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [listing, setListing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    fetchListingDetail();
  }, [id]);

  const fetchPhoto = async () => {
    try {
      const { data, error } = await supabase
        .from("property_Photo")
        .select("photo_url")
        .eq("property_id", id)
        .single();

      if (data) setPhotoUrl(data.photo_url);

      if (error) throw error;
    } catch (error) {
      console.error("Error fetching photo:", error);
    }
  };

  const fetchListingDetail = async () => {
    try {
      console.log("Fetching details for listing ID:", id);
      const { data, error } = await supabase
        .from("property")
        .select("*, users(full_name, email, phone_number)")
        .eq("property_id", id)
        .single();

      if (error) throw error;

      setListing(data);
      fetchPhoto();
    } catch (error) {
      Alert.alert("Error", "Failed to fetch listing details: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from("property")
        .update({ approvalStatus: "approved" })
        .eq("property_id", id);

      if (error) throw error;

      Alert.alert("Success", "Listing approved successfully");
      router.navigate("../PendingListings");
    } catch (error) {
      Alert.alert("Error", "Failed to approve: " + error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      console.log("Rejecting listing with ID:", id);
      const { error } = await supabase
        .from("property")
        .update({ approvalStatus: "rejected" })
        .eq("property_id", id);

      if (error) throw error;

      Alert.alert("Success", "Listing rejected");
      router.navigate("../PendingListings");
    } catch (error) {
      Alert.alert("Error", "Failed to reject: " + error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {listing.users.full_name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.headerName}>{listing.title}</Text>
          <View
            style={[
              styles.statusBadge,
              styles[`${listing.approvalStatus}Badge`],
            ]}
          >
            <Text style={styles.statusText}>
              {listing.approvalStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Landlord Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Landlord Information</Text>

          <View style={styles.infoCard}>
            <InfoRow
              label="Full Name"
              value={listing.users.full_name || "N/A"}
            />
            <InfoRow label="Email" value={listing.users.email} />
            <InfoRow label="Phone" value={listing.users.phone_number} />
          </View>
        </View>

        {/* Property Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Information</Text>

          <View style={styles.infoCard}>
            <InfoRow
              label="Property Type"
              value={listing.propertyType || "N/A"}
            />
            <InfoRow label="Property Size" value={listing.size || "N/A"} />
            <InfoRow label="Street Address" value={listing.address || "N/A"} />
            <InfoRow label="Description" value={listing.description || "N/A"} />
            <InfoRow
              label="Furnishing Level"
              value={listing.furnishingLevel || "N/A"}
            />
            <InfoRow
              label="Monthly Rent (RM)"
              value={listing.monthlyRent || "N/A"}
            />
            <InfoRow
              label="Security Deposit (RM)"
              value={listing.securityDeposit || "N/A"}
            />
            <InfoRow
              label="Utilities Deposit (RM)"
              value={listing.utilitiesDeposit || "N/A"}
            />
            <InfoRow
              label="Minimum Rental Period (months)"
              value={listing.minimumRentalPeriod || "N/A"}
            />
            <InfoRow
              label="Create Date"
              value={new Date(listing.created_at).toLocaleString()}
            />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.approveButton]}
            onPress={() => handleApprove(id)}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Approve Application</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={() => handleReject(id)}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonTextReject}>Reject Application</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

// InfoRow Component
const InfoRow = ({ label, value, action }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    {action ? (
      <TouchableOpacity onPress={action}>
        <Text style={[styles.infoValue, styles.linkText]}>{value}</Text>
      </TouchableOpacity>
    ) : (
      <Text style={styles.infoValue}>{value}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  header: {
    backgroundColor: "#6366F1",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  headerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pendingBadge: {
    backgroundColor: "#FFA500",
  },
  approvedBadge: {
    backgroundColor: "#4CAF50",
  },
  rejectedBadge: {
    backgroundColor: "#f44336",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  linkText: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "#6366F1",
  },
  rejectButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e61717ff",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextReject: {
    color: "#e61717ff",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 30,
  },
});
