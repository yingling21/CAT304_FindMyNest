import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessagesContext";
import { useListing } from "@/contexts/ListingContext";
import LandlordDashboardHeader from "@/components/landlord/LandlordDashboardHeader";
import LandlordOverviewStats from "@/components/landlord/LandlordOverviewStats";
import LandlordQuickActions from "@/components/landlord/LandlordQuickActions";
import LandlordRecentActivity from "@/components/landlord/LandlordRecentActivity";
import { styles } from "./LandlordHomeScreen.styles";

import React, { useMemo } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LandlordHomeScreen() {
  const { user } = useAuth();
  const { totalUnreadCount } = useMessages();
  const { getListingsByLandlord } = useListing();

  const landlordListings = useMemo(() => {
    if (!user) return [];
    return getListingsByLandlord(user.id);
  }, [user, getListingsByLandlord]);

  const totalListings = landlordListings.length;
  const activeListings = landlordListings.filter(listing => listing.status === "approved").length;
  const totalTenants = 0;
  const unreadMessages = totalUnreadCount;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <LandlordDashboardHeader />
        <LandlordOverviewStats
          totalListings={totalListings}
          activeListings={activeListings}
          totalTenants={totalTenants}
          unreadMessages={unreadMessages}
        />
        <LandlordQuickActions />
        <LandlordRecentActivity />
      </ScrollView>
    </SafeAreaView>
  );
}
