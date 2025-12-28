import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { verifyIcWithBackend } from "@/lib/verifyIcApi";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { AlertCircle, CheckCircle, FileText, Upload, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

export default function IdentityVerificationScreen() {
  const { user, reloadUserProfile } = useAuth();
  const router = useRouter();
  const [frontIcUri, setFrontIcUri] = useState<string | null>(null);
  const [backIcUri, setBackIcUri] = useState<string | null>(null);
  const [ownershipDoc, setOwnershipDoc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePickIcImage = async (side: "front" | "back") => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.3, // Aggressive compression (0.3) to reduce 8-20MB images to ~500KB-2MB
        allowsMultipleSelection: false,
        exif: false, // Remove EXIF data to reduce size
      });

      if (!result.canceled && result.assets[0]) {
        if (side === "front") {
          setFrontIcUri(result.assets[0].uri);
        } else {
          setBackIcUri(result.assets[0].uri);
        }
      }
    } catch (err) {
      console.error("Error picking IC image:", err);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setOwnershipDoc(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Error picking document:", err);
      Alert.alert("Error", "Failed to pick document. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!frontIcUri) {
      Alert.alert("Missing Document", "Please upload the front side of your IC");
      return;
    }

    if (!backIcUri) {
      Alert.alert("Missing Document", "Please upload the back side of your IC");
      return;
    }

    if (user?.role === "landlord" && !ownershipDoc) {
      Alert.alert("Missing Document", "Please upload house ownership document");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Starting verification...");
      console.log("Front IC URI:", frontIcUri);
      console.log("Back IC URI:", backIcUri);
      
      // Use backend to OCR both front and back IC images, extract IC numbers,
      // validate that they match, and validate Malaysia IC format (12 digits, DOB, checksum).
      // Ensure email and phoneNumber are always passed to backend for storage in users table
      if (!user || !user.email || !user.phoneNumber) {
        Alert.alert(
          "Missing Information",
          "Email and phone number are required for verification. Please ensure your account information is complete."
        );
        setIsLoading(false);
        return;
      }

      const result = await verifyIcWithBackend(
        frontIcUri, 
        backIcUri,
        { // Pass user info to backend - email and phoneNumber are required
          email: user.email,
          fullName: user.fullName || user.email.split("@")[0], // Fallback to email prefix if fullName missing
          phoneNumber: user.phoneNumber,
          role: user.role || "tenant",
        }
      );
      
      console.log("Verification result:", result);

      if (result.status !== "VERIFIED") {
        Alert.alert(
          "Verification Failed",
          result.reason ||
            "Your IC could not be verified. Please upload clearer IC photos and try again."
        );
        setIsLoading(false);
        return;
      }

      // Backend has already created/updated the user row with all info
      // Just store document URIs without changing verification status
      if (user) {
        try {
          const updates: Record<string, any> = {};
          if (frontIcUri) {
            updates.identity_document = frontIcUri;
          }
          if (ownershipDoc) {
            updates.ownership_document = ownershipDoc;
          }
          if (Object.keys(updates).length > 0) {
            await supabase.from("users").update(updates).eq("id", user.id);
          }
        } catch (err) {
          console.error("Failed to store document URIs:", err);
          // Don't fail the whole flow if document storage fails
        }
      }

      // Reload user profile from database (user row was just created/updated)
      await reloadUserProfile();

      Alert.alert(
        "Verification Successful",
        "Your identity has been verified successfully. You can now use all features.",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate to home page (shopping/browsing page)
              router.replace("/(tabs)/home");
            },
          },
        ]
      );
    } catch (err: any) {
      console.error("Submit error:", err);
      let errorMessage = err?.message || "Unknown error occurred";
      
      // Handle specific Supabase errors
      if (errorMessage.includes("Cannot coerce") || errorMessage.includes("PGRST")) {
        errorMessage = "Database error: Unable to process verification. Please try again or contact support.";
      }
      
      console.error("Error details:", JSON.stringify(err, null, 2));
      
      Alert.alert(
        "Error", 
        `Failed to submit documents for verification.\n\nError: ${errorMessage}\n\nPlease check:\n1. Backend server is running on port 5001\n2. Images are valid and readable\n3. Network connection is stable`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      "Verification Required",
      "For your safety and to prevent fraud, IC verification is required. You cannot skip this step."
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <FileText size={32} color="#6366F1" />
          </View>
          <Text style={styles.title}>Identity Verification</Text>
          <Text style={styles.subtitle}>
            {user?.role === "landlord"
              ? "Upload your IC and house ownership documents to verify your account"
              : "Upload your IC to verify your identity"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IC Front Side (Required)</Text>
          <Text style={styles.sectionDesc}>
            Upload a clear photo of the front side of your IC
          </Text>

          {frontIcUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: frontIcUri }} style={styles.imagePreview} />
              <Pressable
                style={styles.removeImageButton}
                onPress={() => setFrontIcUri(null)}
              >
                <X size={20} color="#FFFFFF" />
              </Pressable>
              <Pressable
                style={styles.changeImageButton}
                onPress={() => handlePickIcImage("front")}
              >
                <Text style={styles.changeImageText}>Change Image</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.uploadCard}
              onPress={() => handlePickIcImage("front")}
            >
              <Upload size={32} color="#6366F1" />
              <Text style={styles.uploadText}>Tap to upload front IC</Text>
              <Text style={styles.uploadHint}>JPG or PNG</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IC Back Side (Required)</Text>
          <Text style={styles.sectionDesc}>
            Upload a clear photo of the back side of your IC
          </Text>

          {backIcUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: backIcUri }} style={styles.imagePreview} />
              <Pressable
                style={styles.removeImageButton}
                onPress={() => setBackIcUri(null)}
              >
                <X size={20} color="#FFFFFF" />
              </Pressable>
              <Pressable
                style={styles.changeImageButton}
                onPress={() => handlePickIcImage("back")}
              >
                <Text style={styles.changeImageText}>Change Image</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.uploadCard}
              onPress={() => handlePickIcImage("back")}
            >
              <Upload size={32} color="#6366F1" />
              <Text style={styles.uploadText}>Tap to upload back IC</Text>
              <Text style={styles.uploadHint}>JPG or PNG</Text>
            </Pressable>
          )}
        </View>

        {user?.role === "landlord" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>House Ownership Document (Required)</Text>
            <Text style={styles.sectionDesc}>
              Upload proof of house ownership (e.g., property deed, title document)
            </Text>

            <Pressable
              style={[styles.uploadCard, ownershipDoc && styles.uploadCardSuccess]}
              onPress={handlePickDocument}
            >
              {ownershipDoc ? (
                <>
                  <CheckCircle size={32} color="#10B981" />
                  <Text style={styles.uploadTextSuccess}>Document Uploaded</Text>
                  <Text style={styles.uploadHint}>Tap to change</Text>
                </>
              ) : (
                <>
                  <Upload size={32} color="#6366F1" />
                  <Text style={styles.uploadText}>Tap to upload document</Text>
                  <Text style={styles.uploadHint}>JPG, PNG, or PDF</Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        <View style={styles.infoBox}>
          <AlertCircle size={20} color="#6366F1" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Verification Process</Text>
            <Text style={styles.infoText}>
              We will automatically verify your IC by checking the format, date of birth, and ensuring both sides match. Verification is typically completed within seconds.
            </Text>
          </View>
        </View>

        <Pressable
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit for Verification</Text>
          )}
        </Pressable>

        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  uploadCard: {
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  uploadCardSuccess: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
    borderStyle: "solid",
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginTop: 12,
  },
  uploadTextSuccess: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#10B981",
    marginTop: 12,
  },
  uploadHint: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600" as const,
  },
  skipButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  skipText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  imagePreviewContainer: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#10B981",
    backgroundColor: "#F9FAFB",
  },
  imagePreview: {
    width: "100%",
    height: 300,
    resizeMode: "contain",
    backgroundColor: "#F9FAFB",
  },
  removeImageButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#EF4444",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  changeImageButton: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: "#6366F1",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  changeImageText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
