import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/src/api/users";
import { profileStyles as styles } from "@/styles/tabs";

export default function EditProfileScreen() {
  const { user, reloadUserProfile } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName || "");
    setPhoneNumber(user?.phoneNumber || "");
  }, [user]);

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={{ padding: 24 }}>
          <Text style={{ fontSize: 16 }}>You must be signed in to edit your profile.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(user.id, {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
      });

      // Refresh context data
      await reloadUserProfile();

      router.back();
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <View style={{ padding: 24 }}>
        <Text style={{ color: "#6B7280", marginBottom: 6 }}>Full Name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
          style={{
            borderWidth: 1,
            borderColor: "#E5E7EB",
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 16,
            backgroundColor: "#FFFFFF",
          }}
        />

        <Text style={{ color: "#6B7280", marginBottom: 6 }}>Phone Number</Text>
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          style={{
            borderWidth: 1,
            borderColor: "#E5E7EB",
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 24,
            backgroundColor: "#FFFFFF",
          }}
        />

        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable
            style={{ flex: 1, backgroundColor: "#F3F4F6", padding: 14, borderRadius: 10, alignItems: "center" }}
            onPress={() => router.back()}
            disabled={isSaving}
          >
            <Text style={{ color: "#374151", fontWeight: "600" }}>Cancel</Text>
          </Pressable>

          <Pressable
            style={{ flex: 1, backgroundColor: "#6366F1", padding: 14, borderRadius: 10, alignItems: "center" }}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Save</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
