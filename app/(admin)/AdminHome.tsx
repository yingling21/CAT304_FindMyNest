import AdminDashboardHeader from "@/components/admin/AdminDashboardHeader";
import AdminOverviewStats from "@/components/admin/AdminOverviewStats";
import AdminQuickActions from "@/components/admin/AdminQuickActions";

import { useState, useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { useNavigation } from "expo-router";

export default function AdminHomeScreen() {
  const [totalTenants, setTotalTenants] = useState(0);
  const [totalLandlords, setTotalLandlords] = useState(0);
  const [totalListings, setTotalListings] = useState(0);
  const [pendingLandlordApprovals, setPendingLandlordApprovals] = useState(0);
  const [pendingListingApprovals, setPendingListingApprovals] = useState(0);
  const [totalRentals, setTotalRentals] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchDashboardStats();
      console.log("Home page back in focus");
    });

    return unsubscribe;
  }, [navigation]);

  const fetchDashboardStats = async () => {
    try {
      const { count: tenantsCount, error: tenantsError } = await supabase
        .from("users")
        .select("*", { count: "exact" })
        .eq("role", "tenant")
        .eq("verification_status", "approved");

      if (tenantsError) throw tenantsError;
      if (tenantsCount) setTotalTenants(tenantsCount);

      const { count: landlordsCount, error: landlordsError } = await supabase
        .from("users")
        .select("*", { count: "exact" })
        .eq("role", "landlord")
        .eq("verification_status", "approved");

      if (landlordsError) throw landlordsError;
      if (landlordsCount) setTotalLandlords(landlordsCount);

      const { count: listingsCount, error: listingsError } = await supabase
        .from("property")
        .select("*", { count: "exact" })
        .eq("approvalStatus", "approved");

      if (listingsError) throw listingsError;
      if (listingsCount) setTotalListings(listingsCount);

      const {
        count: pendingLandlordApprovalsCount,
        error: pendingLandlordApprovalsError,
      } = await supabase
        .from("users")
        .select("*", { count: "exact" })
        .eq("role", "landlord")
        .eq("verification_status", "pending");

      if (pendingLandlordApprovalsError) throw pendingLandlordApprovalsError;
      if (pendingLandlordApprovalsCount)
        setPendingLandlordApprovals(pendingLandlordApprovalsCount);
      const {
        count: pendingListingApprovalsCount,
        error: pendingListingApprovalsError,
      } = await supabase
        .from("property")
        .select("*", { count: "exact" })
        .eq("approvalStatus", "pending");
      if (pendingListingApprovalsError) throw pendingListingApprovalsError;
      if (pendingListingApprovalsCount)
        setPendingListingApprovals(pendingListingApprovalsCount);

      const { count: rentalsCount, error: rentalsError } = await supabase
        .from("rentals")
        .select("*", { count: "exact" })
        .eq("status", "confirmed");

      if (rentalsError) throw rentalsError;
      if (rentalsCount) setTotalRentals(rentalsCount);

    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <AdminDashboardHeader />
        <AdminOverviewStats
          totalListings={totalListings}
          totalLandlords={totalLandlords}
          totalTenants={totalTenants}
          pendingLandlordApprovals={pendingLandlordApprovals}
          pendingListingApprovals={pendingListingApprovals}
          totalRentals={totalRentals}
        />
        <AdminQuickActions />
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});