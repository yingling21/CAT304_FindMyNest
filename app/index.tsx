import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function IndexScreen() {
  const { user, hasCompletedOnboarding, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!hasCompletedOnboarding) {
      router.replace("/onboarding");
    } else if (!user) {
      router.replace("/login");
    } else {
      // Check verification status - only allow access if approved
      // NULL, undefined, "pending", "rejected", "unverified" all require IC verification
      // If approved, go directly to home (IC verification already completed)
      const verificationStatus = user.verificationStatus;
      if (!verificationStatus || verificationStatus === null || verificationStatus !== "approved") {
        const statusDisplay = verificationStatus === null ? "NULL (not verified)" : verificationStatus || "undefined";
        console.log(`[Index] User verification status is "${statusDisplay}", redirecting to IC verification.`);
        router.replace("/identity-verification");
      } else {
        // User is approved - go directly to home (no IC verification needed)
        console.log(`[Index] User verification status is "approved". Going directly to home page.`);
        router.replace("/(tabs)/home");
      }
    }
  }, [user, hasCompletedOnboarding, isLoading, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6366F1" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
});
