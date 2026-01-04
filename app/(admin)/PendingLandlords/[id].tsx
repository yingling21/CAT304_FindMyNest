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
  FlatList,
  Modal,
  Dimensions,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

const { width } = Dimensions.get("window");

export default function PendingLandlordDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [landlord, setLandlord] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
    fetchLandlordDetail();
  }, [id]);

  const fetchPhoto = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("ownership_document")
        .eq("id", id);

      if (data[0].ownership_document) setPhotoUrl(data);
      else setPhotoUrl(null);

      if (error) throw error;
    } catch (error) {
      console.error("Error fetching photo:", error);
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImage(null);
  };

  const isPDF = (url) => {
    return url?.toLowerCase().endsWith(".pdf");
  };

  const openDocument = async (url) => {
    if (isPDF(url)) {
      //   Note: Expo Go does not support any native PDF viewer, roundabout method required
      //   Open PDF in browser or external viewer
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // If no external viewer, download and share
        const result = await FileSystem.downloadAsync(
          url,
          FileSystem.documentDirectory + "document.pdf"
        );

        //  Open native sharing/viewer if possible
        await Sharing.shareAsync(result.uri);
        Alert.alert("Error", "Cannot open this PDF file");
      }
    } else {
      // Open image in modal
      openImageModal(url);
    }
  };

  const fetchLandlordDetail = async () => {
    try {
      console.log("Fetching details for landlord ID:", id);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setLandlord(data);
      await fetchPhoto();
      console.log("Data in photoUrl:", photoUrl);
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to fetch landlord details: " + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          verification_status: "approved",
          verification_status_manual: true,
        })
        .eq("id", id);

      if (error) throw error;

      Alert.alert("Success", "Landlord approved successfully");
      router.navigate("../PendingLandlords");
    } catch (error) {
      Alert.alert("Error", "Failed to approve: " + error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      console.log("Rejecting landlord with ID:", id);
      const { error } = await supabase
        .from("users")
        .update({ verification_status: "rejected" })
        .eq("id", id);

      if (error) throw error;

      Alert.alert("Success", "Landlord rejected");
      router.navigate("../PendingLandlords");
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
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {landlord.full_name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.headerName}>{landlord.full_name}</Text>
          <View
            style={[
              styles.statusBadge,
              styles[`${landlord.verification_status}Badge`],
            ]}
          >
            <Text style={styles.statusText}>
              {landlord.verification_status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Landlord Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Landlord Information</Text>

          <View style={styles.infoCard}>
            <InfoRow label="Full Name" value={landlord.full_name || "N/A"} />
            <InfoRow label="Email" value={landlord.email} />
            <InfoRow label="Phone" value={landlord.phone_number} />
          </View>
        </View>

        {/* Documents & Pictures Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents & Pictures</Text>

          {photoUrl ? (
            <View style={styles.documentsContainer}>
              <FlatList
                data={photoUrl}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.documentsScroll}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.documentItem}
                    onPress={() => openDocument(item.ownership_document)}
                    activeOpacity={0.8}
                  >
                    {isPDF(item.ownership_document) ? (
                      <View
                        style={[styles.documentThumbnail, styles.pdfThumbnail]}
                      >
                        <Text style={styles.pdfIcon}>📄</Text>
                        <Text style={styles.pdfText}>PDF</Text>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: item.ownership_document }}
                        style={styles.documentThumbnail}
                        resizeMode="cover"
                      />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          ) : (
            <View style={styles.infoCard}>
              <Text style={styles.noDataText}>No documents uploaded</Text>
            </View>
          )}
        </View>

        {/* Image Modal */}
        <Modal
          visible={imageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeImageModal}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalBackground}
              activeOpacity={1}
              onPress={closeImageModal}
            >
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeImageModal}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>

                {selectedImage && (
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.fullImage}
                    resizeMode="contain"
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

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
    borderWidth: 2,
    borderColor: "#fff",
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
  documentsContainer: {
    marginHorizontal: 16,
  },
  documentsScroll: {
    // paddingRight: 16,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  documentItem: {
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentThumbnail: {
    width: 150,
    height: 150,
    backgroundColor: "#f0f0f0",
  },
  noDataText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  fullImage: {
    width: width,
    height: "80%",
  },
  pdfThumbnail: {
    width: 150,
    height: 150,
    backgroundColor: "#3b9acaff",
    flexDirection: "column",
    justifyContent: "center",
    alignContent: "center",
  },
  pdfIcon: {
    fontSize: 50,
    textAlign: "center",
  },
  pdfText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
  },
});
