import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Pressable,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useNavigation } from "expo-router";

export default function ListingApprovalScreen() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    fetchPendingListings();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchPendingListings();
      console.log("Pending Listings page is in focus");
    });

    return unsubscribe;
  }, [navigation]);

  const fetchPendingListings = async () => {
    try {
      const { data, error } = await supabase
        .from("property")
        .select(
          "property_id, propertyType, description, address, created_at, title, approvalStatus, users(full_name)"
        )
        .eq("approvalStatus", "pending");

      if (error) throw error;

      setListings(data || []);
    } catch (error) {
      console.log("Error", "Failed to fetch listings: " + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingListings();
  };

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from("property")
        .update({ approvalStatus: "approved" })
        .eq("property_id", id);

      if (error) throw error;

      Alert.alert("Success", "Listing approved successfully");
      fetchPendingListings();
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
      fetchPendingListings();
    } catch (error) {
      Alert.alert("Error", "Failed to reject: " + error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.title || "N/A"}</Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Landlord:</Text>
        <Text style={styles.value}>{item.users.full_name || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Type:</Text>
        <Text style={styles.value}>{item.propertyType || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>{item.address || "N/A"}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.approveButton]}
          onPress={() => handleApprove(item.property_id)}
        >
          <Text style={styles.buttonText}>Approve</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => handleReject(item.property_id)}
        >
          <Text style={styles.buttonTextReject}>Reject</Text>
        </TouchableOpacity>

        <Pressable
          style={[styles.button, styles.viewButton]}
          onPress={() => {
            router.push(`/PendingListings/${item.property_id}`);
            fetchPendingListings();
          }}
        >
          <Text style={styles.buttonTextView}>View More</Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading listings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Pending Listing Approvals</Text>
        <Text style={styles.subtitle}>
          {listings.length} listing{listings.length !== 1 ? "s" : ""} waiting
          for approval
        </Text>

        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={(item) => item.property_id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No pending approvals</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 16,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: "#6366F1",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#6366F1",
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    width: 70,
  },
  value: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
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
  viewButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#6e6c6cff",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonTextReject: {
    color: "#e61717ff",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonTextView: {
    color: "#6e6c6cff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});
