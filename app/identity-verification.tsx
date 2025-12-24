import { useAuth } from "@/contexts/AuthContext";
import * as DocumentPicker from "expo-document-picker";
import { AlertCircle, CheckCircle, FileText, Upload } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { verificationStyles as styles } from "@/styles/auth";

export default function IdentityVerificationScreen() {
  const { user, completeVerification } = useAuth();
  const [identityDoc, setIdentityDoc] = useState<string | null>(null);
  const [ownershipDoc, setOwnershipDoc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePickDocument = async (type: "identity" | "ownership") => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const docUri = result.assets[0].uri;
        if (type === "identity") {
          setIdentityDoc(docUri);
        } else {
          setOwnershipDoc(docUri);
        }
      }
    } catch (err) {
      console.error("Error picking document:", err);
      Alert.alert("Error", "Failed to pick document. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!identityDoc) {
      Alert.alert("Missing Document", "Please upload your IC for identity verification");
      return;
    }

    if (user?.role === "landlord" && !ownershipDoc) {
      Alert.alert("Missing Document", "Please upload house ownership document");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await completeVerification(identityDoc, ownershipDoc || undefined);
      Alert.alert(
        "Documents Submitted",
        user?.role === "landlord"
          ? "Your documents have been submitted for verification. You can access your landlord dashboard while we review your documents."
          : "Your IC has been submitted for verification. You can browse properties while we verify your identity."
      );
    } catch (err) {
      console.error("Submit error:", err);
      Alert.alert("Error", "Failed to submit documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      "Skip Verification",
      "You can verify your identity later from your profile. Some features may be limited until verification is complete.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Skip",
          onPress: async () => {
            await completeVerification();
          },
        },
      ]
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
          <Text style={styles.sectionTitle}>IC Upload (Required)</Text>
          <Text style={styles.sectionDesc}>
            Upload a clear photo of your IC for identity verification
          </Text>

          <Pressable
            style={[styles.uploadCard, identityDoc && styles.uploadCardSuccess]}
            onPress={() => handlePickDocument("identity")}
          >
            {identityDoc ? (
              <>
                <CheckCircle size={32} color="#10B981" />
                <Text style={styles.uploadTextSuccess}>IC Uploaded</Text>
                <Text style={styles.uploadHint}>Tap to change</Text>
              </>
            ) : (
              <>
                <Upload size={32} color="#6366F1" />
                <Text style={styles.uploadText}>Tap to upload IC</Text>
                <Text style={styles.uploadHint}>JPG, PNG, or PDF</Text>
              </>
            )}
          </Pressable>
        </View>

        {user?.role === "landlord" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>House Ownership Document (Required)</Text>
            <Text style={styles.sectionDesc}>
              Upload proof of house ownership (e.g., property deed, title document)
            </Text>

            <Pressable
              style={[styles.uploadCard, ownershipDoc && styles.uploadCardSuccess]}
              onPress={() => handlePickDocument("ownership")}
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
              {user?.role === "landlord"
                ? "Documents typically reviewed within 24-48 hours. You can access your dashboard while we verify."
                : "Documents typically reviewed within 24 hours. You can browse properties during verification."}
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

