import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessagesContext";
import { useListing } from "@/contexts/ListingContext";
import { useRentals } from "@/contexts/RentalsContext";
import LandlordDashboardHeader from "@/components/landlord/LandlordDashboardHeader";
import LandlordOverviewStats from "@/components/landlord/LandlordOverviewStats";
import LandlordQuickActions from "@/components/landlord/LandlordQuickActions";
import LandlordRecentActivity from "@/components/landlord/LandlordRecentActivity";
import React, { useMemo } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { landlordHomeStyles as styles } from "@/styles/LandlordHomeScreen.styles";

export default function LandlordHomeScreen() {
  const { user } = useAuth();
  const { totalUnreadCount } = useMessages();
  const { getListingsByLandlord } = useListing();
  const { getLandlordRentals } = useRentals();

  const landlordListings = useMemo(() => {
    if (!user) return [];
    return getListingsByLandlord(user.id);
  }, [user, getListingsByLandlord]);

  const landlordRentals = useMemo(() => {
    return getLandlordRentals();
  }, [getLandlordRentals]);

  const totalListings = landlordListings.length;
  const activeListings = landlordListings.filter(listing => listing.status === "approved").length;
  
  // Count unique tenants from rentals (excluding cancelled rentals)
  const totalTenants = useMemo(() => {
    const activeRentals = landlordRentals.filter(
      rental => rental.status !== "cancelled"
    );
    const uniqueTenantIds = new Set(
      activeRentals.map(rental => rental.tenantId)
    );
    return uniqueTenantIds.size;
  }, [landlordRentals]);
  
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
