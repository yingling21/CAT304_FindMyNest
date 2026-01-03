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
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

export default function RemoveListingScreen() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchQuery]);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from("property")
        .select("*, users(full_name, email, phone_number)")
        .eq("approvalStatus", "approved")
        .order("title", { ascending: true });

      if (error) throw error;

      setListings(data || []);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch listings: " + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterListings = () => {
    let filtered = listings;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (listing) =>
          listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.users.full_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          listing.users.email
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          listing.users.phone_number?.includes(searchQuery)
      );
    }

    setFilteredListings(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const openDeleteModal = (listing) => {
    setSelectedListing(listing);
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setSelectedListing(null);
  };

  const handleDeleteListing = async () => {
    try {
      const { error } = await supabase
        .from("property")
        .update({
          approvalStatus: "rejected",
        })
        .eq("id", selectedListing.property_id);

      if (error) throw error;

      Alert.alert(
        "Success",
        `${selectedListing.users.full_name} has been banned`
      );
      closeDeleteModal();
      fetchListings();
    } catch (error) {
      Alert.alert("Error", "Failed to delete listing: " + error.message);
    }
  };

  const renderListingCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.title || "N/A"}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Property Type:</Text>
        <Text style={styles.value}>{item.propertyType || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>{item.address || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Description:</Text>
        <Text style={styles.value}>{item.description || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Property Size:</Text>
        <Text style={styles.value}>{item.size || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Listing Created At:</Text>
        <Text style={styles.value}>{new Date(item.created_at).toLocaleDateString() || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Landlord:</Text>
        <Text style={styles.value}>{item.users.full_name || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{item.users.email || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{item.users.phone_number || "N/A"}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.banButton]}
          onPress={() => openDeleteModal(item)}
        >
          <Text style={styles.buttonText}>Delete Listing</Text>
        </TouchableOpacity>
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
        <Text style={styles.title}>Property Listing Management</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, name, email, or phone..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Property List */}
        <FlatList
          data={filteredListings}
          renderItem={renderListingCard}
          keyExtractor={(item) => item.property_id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No listings found</Text>
            </View>
          }
        />

        {/* Delete Modal */}
        <Modal
          visible={deleteModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeDeleteModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Listing</Text>

              {selectedListing && (
                <View style={styles.modalUserInfo}>
                  <Text style={styles.modalUserName}>
                    {selectedListing.title}
                  </Text>
                  <Text style={styles.modalUserAdditionalInfo}>
                    Type: {selectedListing.propertyType}
                  </Text>
                  <Text style={styles.modalUserAdditionalInfo}>
                    Address: {selectedListing.address}
                  </Text>
                  <Text style={styles.modalUserAdditionalInfo}>
                    Description: {selectedListing.description}
                  </Text>
                  <Text style={styles.modalUserAdditionalInfo}>
                    Created At: {new Date(selectedListing.created_at).toLocaleDateString()}
                  </Text>
                  <Text style={styles.modalUserAdditionalInfo}>
                    Landlord: {selectedListing.users.full_name}
                  </Text>
                  <Text style={styles.modalUserAdditionalInfo}>
                    Email: {selectedListing.users.email}
                  </Text>
                  <Text style={styles.modalUserAdditionalInfo}>
                    Phone: {selectedListing.users.phone_number}
                  </Text>
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={closeDeleteModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmBanButton]}
                  onPress={handleDeleteListing}
                >
                  <Text style={styles.buttonText}>Confirm Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 16,
    backgroundColor: "#6366F1",
    color: "#fff",
  },
  searchContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  searchInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f5f5f5",
  },
  activeTab: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#8285f4",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#8285f4",
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
    alignItems: "flex-start",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#4f52c1",
    paddingBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  joinDate: {
    fontSize: 12,
    color: "#999",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    width: 90,
    marginRight: 8,
  },
  value: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    alignSelf: "center",
  },
  actionButtons: {
    marginTop: 12,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  banButton: {
    backgroundColor: "#f44336",
  },
  unbanButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "#fff",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  modalUserInfo: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  modalUserAdditionalInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
  },
  confirmBanButton: {
    backgroundColor: "#f44336",
  },
});
