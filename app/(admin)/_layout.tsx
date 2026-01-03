import { useAuth } from "@/contexts/AuthContext";
import { Tabs, useRouter } from "expo-router";
import { Home, LogOut, UserRoundPen, HousePlus } from "lucide-react-native";
import { useEffect } from "react";
import { Pressable } from "react-native";

export default function TabLayout() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // CRITICAL: Ensure only verified users can access the main app
  useEffect(() => {
    if (user) {
      const verificationStatus = user.verificationStatus;
      // If verification_status is NULL, undefined, or not "approved", redirect to IC verification
      if (
        !verificationStatus ||
        verificationStatus === null ||
        verificationStatus !== "approved"
      ) {
        const statusDisplay =
          verificationStatus === null
            ? "NULL (not verified)"
            : verificationStatus || "undefined";
        console.log(
          `[TabLayout] User verification status is "${statusDisplay}", redirecting to IC verification.`
        );
        router.replace("/identity-verification");
      }
    }
  }, [user, router]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        },
      }}
    >
      <Tabs.Screen
        name="AdminHome"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="PendingLandlords"
        options={{
          title: "Pending Landlords",
          tabBarIcon: ({ color }) => <UserRoundPen size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="PendingListings"
        options={{
          title: "Pending Listings",
          tabBarIcon: ({ color }) => <HousePlus size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="SignOut"
        options={{
          title: "Sign Out",
          tabBarIcon: ({ color }) => <LogOut size={24} color={color} />,
          tabBarButton: (props) => (
            <Pressable {...props} onPress={signOut} />
          ),
        }}
      />

      <Tabs.Screen
        name="PendingListings/[id]"
        options={{
          href : null,
        }}
      />

      <Tabs.Screen
        name="PendingLandlords/[id]"
        options={{
          href : null,
        }}
      />

      <Tabs.Screen
        name="BanUser"
        options={{
          href : null,
        }}
      />

      <Tabs.Screen
        name="RemoveListing"
        options={{
          href : null,
        }}
      />
    </Tabs>
  );
}
