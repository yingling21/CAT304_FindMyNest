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
} from "react-native";
import { supabase } from "../../lib/supabase";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LandlordApprovalScreen() {
  const [landlords, setLandlords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPendingLandlords();
  }, []);

  const fetchPendingLandlords = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "landlord")
        .eq("verification_status", "pending");

      if (error) throw error;

      setLandlords(data || []);
    } catch (error) {
      console.log("Error", "Failed to fetch landlords: " + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingLandlords();
  };

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ verification_status: "approved" })
        .eq("id", id);

      if (error) throw error;

      Alert.alert("Success", "Landlord approved successfully");
      fetchPendingLandlords();
    } catch (error) {
      Alert.alert("Error", "Failed to approve: " + error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ verification_status: "rejected" })
        .eq("id", id);

      if (error) throw error;

      Alert.alert("Success", "Landlord rejected");
      fetchPendingLandlords();
    } catch (error) {
      Alert.alert("Error", "Failed to reject: " + error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.full_name || "N/A"}</Text>
        {/* <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text> */}
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{item.email || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{item.phone_number || "N/A"}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.approveButton]}
          onPress={() => handleApprove(item.id)}
        >
          <Text style={styles.buttonText}>Approve</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => handleReject(item.id)}
        >
          <Text style={styles.buttonTextAccent}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading landlords...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Pending Landlord Approvals</Text>
        <Text style={styles.subtitle}>
          {landlords.length} landlord{landlords.length !== 1 ? "s" : ""} waiting
          for approval
        </Text>

        <FlatList
          data={landlords}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
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
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonTextAccent: {
    color: "#e61717ff",
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
