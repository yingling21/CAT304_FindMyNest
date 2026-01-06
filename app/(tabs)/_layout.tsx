import { useMessages } from "@/contexts/MessagesContext";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, useRouter } from "expo-router";
import { Home, Heart, MapPin, User, MessageCircle, LayoutDashboard, Building2 } from "lucide-react-native";
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#EF4444",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});

export default function TabLayout() {
  const messagesContext = useMessages();
  const { user } = useAuth();
  const router = useRouter();
  const unreadCount = messagesContext?.totalUnreadCount || 0;
  const isLandlord = user?.role === "landlord";

  // CRITICAL: Ensure only verified users can access the main app
  useEffect(() => {
    if (user) {
      const verificationStatus = user.verificationStatus;
      // If verification_status is NULL, undefined, or not "approved", redirect to IC verification
      if (!verificationStatus || verificationStatus === null || verificationStatus !== "approved") {
        const statusDisplay = verificationStatus === null ? "NULL (not verified)" : verificationStatus || "undefined";
        console.log(`[TabLayout] User verification status is "${statusDisplay}", redirecting to IC verification.`);
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
        name="home"
        options={{
          title: isLandlord ? "Dashboard" : "Home",
          tabBarIcon: ({ color }) => isLandlord ? <LayoutDashboard size={24} color={color} /> : <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => <MapPin size={24} color={color} />,
          href: isLandlord ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="listing"
        options={{
          title: "Listing",
          tabBarIcon: ({ color }) => <Building2 size={24} color={color} />,
          href: isLandlord ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color }) => <Heart size={24} color={color} />,
          href: isLandlord ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => (
            <View>
              <MessageCircle size={24} color={color} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null, // Hide Edit Profile from tab bar
        }}
      />
    </Tabs>
  );
}
