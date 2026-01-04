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

export default function BanUsersScreen() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("active"); // active, banned, all
  const [banModalVisible, setBanModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, selectedTab]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("verification_status", "approved")
        .order("full_name", { ascending: true });

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch users: " + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by tab
    if (selectedTab === "active") {
      filtered = filtered.filter((user) => !user.is_banned);
    } else if (selectedTab === "banned") {
      filtered = filtered.filter((user) => user.is_banned);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phone_number?.includes(searchQuery)
      );
    }

    setFilteredUsers(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const openBanModal = (user) => {
    setSelectedUser(user);
    setBanModalVisible(true);
  };

  const closeBanModal = () => {
    setBanModalVisible(false);
    setSelectedUser(null);
  };

  const handleBanUser = async () => {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_banned: true,
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      Alert.alert("Success", `${selectedUser.full_name} has been banned`);
      closeBanModal();
      fetchUsers();
    } catch (error) {
      Alert.alert("Error", "Failed to ban user: " + error.message);
    }
  };

  const handleUnbanUser = async (user) => {
    Alert.alert(
      "Confirm Unban",
      `Are you sure you want to unban ${user.full_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unban",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("users")
                .update({
                  is_banned: false,
                })
                .eq("id", user.id);

              if (error) throw error;

              Alert.alert("Success", `${user.full_name} has been unbanned`);
              fetchUsers();
            } catch (error) {
              Alert.alert("Error", "Failed to unban user: " + error.message);
            }
          },
        },
      ]
    );
  };

  const renderUserCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.full_name || "N/A"}</Text>
          {item.is_banned && (
            <View style={styles.bannedBadge}>
              <Text style={styles.bannedText}>BANNED</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{item.email || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{item.phone_number || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>User Type:</Text>
        <Text style={styles.value}>{item.role || "N/A"}</Text>
      </View>

      <View style={styles.actionButtons}>
        {item.is_banned ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.unbanButton]}
            onPress={() => handleUnbanUser(item)}
          >
            <Text style={styles.buttonText}>Unban User</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.banButton]}
            onPress={() => openBanModal(item)}
          >
            <Text style={styles.buttonText}>Ban User</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>User Management</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Tab Filters */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "active" && styles.activeTab]}
            onPress={() => setSelectedTab("active")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "active" && styles.activeTabText,
              ]}
            >
              Active ({users.filter((u) => !u.is_banned).length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === "banned" && styles.activeTab]}
            onPress={() => setSelectedTab("banned")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "banned" && styles.activeTabText,
              ]}
            >
              Banned ({users.filter((u) => u.is_banned).length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === "all" && styles.activeTab]}
            onPress={() => setSelectedTab("all")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "all" && styles.activeTabText,
              ]}
            >
              All ({users.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* User List */}
        <FlatList
          data={filteredUsers}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
        />

        {/* Ban Modal */}
        <Modal
          visible={banModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeBanModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Ban User</Text>

              {selectedUser && (
                <View style={styles.modalUserInfo}>
                  <Text style={styles.modalUserName}>{selectedUser.full_name}</Text>
                  <Text style={styles.modalUserAdditionalInfo}>
                    Email: {selectedUser.email}
                  </Text>
                  <Text style={styles.modalUserAdditionalInfo}>
                    Role: {selectedUser.role}
                  </Text>
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={closeBanModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmBanButton]}
                  onPress={handleBanUser}
                >
                  <Text style={styles.buttonText}>Confirm Ban</Text>
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
  bannedBadge: {
    backgroundColor: "#f44336",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bannedText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  joinDate: {
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
    width: 90,
  },
  value: {
    fontSize: 14,
    color: "#333",
    flex: 1,
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
