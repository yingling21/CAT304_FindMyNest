import PropertyCard from "@/components/PropertyCard";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessagesContext";
import { useListing } from "@/contexts/ListingContext";
import { supabase } from "@/lib/supabase";
import AffordabilityCalculator from "@/app/affordability-calculator";
import PropertySearchHeader from "@/components/tenant/PropertySearchHeader";
import PropertyFilterTools from "@/components/tenant/PropertyFilterTools";
import PropertyFiltersModal from "@/components/tenant/PropertyFiltersModal";
import type { Filters } from "@/components/tenant/PropertyFiltersModal";
import LandlordDashboardHeader from "@/components/landlord/LandlordDashboardHeader";
import LandlordOverviewStats from "@/components/landlord/LandlordOverviewStats";
import LandlordQuickActions from "@/components/landlord/LandlordQuickActions";
import LandlordRecentActivity from "@/components/landlord/LandlordRecentActivity";

import { Search, Building2, Home, Users, MessageSquare, ChevronRight, Plus, Wallet, User, CheckCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const initialFilters: Filters = {
  location: "",
  propertyTypes: [],
  priceMin: "",
  priceMax: "",
  sizeMin: "",
  sizeMax: "",
  bedrooms: null,
  bathrooms: null,
  furnishing: [],
  amenities: {
    airConditioning: false,
    wifi: false,
    parking: false,
    kitchenAccess: false,
    washingMachine: false,
    security: false,
  },
};

function TenantHomeScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = React.useState<any[]>([]);
  const [loading,setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>(initialFilters);

const filteredProperties = useCallback(async () => {
  setLoading(true);
  let query = supabase.from("Property").select("*");

  if (searchQuery) {
    query = query.or(
      `title.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`
    );
  }

  if (filters.location) query = query.ilike("address", `%${filters.location}%`);
  if (filters.propertyTypes.length > 0) query = query.in("property_type", filters.propertyTypes);
  if (filters.priceMin) query = query.gte("monthly_rent", Number(filters.priceMin));
  if (filters.priceMax) query = query.lte("monthly_rent", Number(filters.priceMax));
  if (filters.sizeMin) query = query.gte("size", Number(filters.sizeMin));
  if (filters.sizeMax) query = query.lte("size", Number(filters.sizeMax));
  if (filters.bedrooms) query = query.gte("bedrooms", filters.bedrooms);
  if (filters.bathrooms) query = query.gte("bathrooms", filters.bathrooms);
  if (filters.furnishing.length > 0) query = query.in("furnishing_level", filters.furnishing);

  Object.entries(filters.amenities).forEach(([key, value]) => {
    if (value) query = query.eq(`amenities->>${key}`, "true");
  });

  query = query.order("created_At", { ascending: false });

  const { data, error } = await query;
  if (error) console.error("Supabase error:", error);
  else setProperties(data || []);

  setLoading(false);
}, [searchQuery, filters]);

useEffect(() => {
    filteredProperties();  
}, [filteredProperties]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.location) count++;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.priceMin || filters.priceMax) count++;
    if (filters.sizeMin || filters.sizeMax) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (filters.furnishing.length > 0) count++;
    if (Object.values(filters.amenities).some((v) => v)) count++;
    return count;
  }, [filters]);

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <PropertySearchHeader
          userName={user?.fullName || "Guest"}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <View style={styles.searchSection}>
          <PropertyFilterTools
            activeFiltersCount={activeFiltersCount}
            onFilterPress={() => setShowFilters(true)}
            onCalculatorPress={() => setShowCalculator(true)}
          />
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {properties.length} {properties.length === 1 ? "property" : "properties"} found
          </Text>
          <Pressable>
            <Text style={styles.sortButton}>Newest</Text>
          </Pressable>
        </View>

        <View style={styles.propertiesContainer}>
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </View>

        {properties.length === 0 && (
          <View style={styles.emptyState}>
            <Search size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No Properties Found</Text>
            <Text style={styles.emptyStateDesc}>
              Try adjusting your search or filters to find what you&apos;re looking for.
            </Text>
          </View>
        )}
      </ScrollView>

      <AffordabilityCalculator
        visible={showCalculator}
        onClose={() => setShowCalculator(false)}
      />

      <PropertyFiltersModal
        visible={showFilters}
        filters={filters}
        onClose={() => setShowFilters(false)}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 24,
    marginBottom: 32,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: "#9CA3AF",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 20,
  },
  exploreGrid: {
    flexDirection: "row",
    gap: 16,
  },
  exploreCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  exploreIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  exploreTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  exploreSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  comingSoon: {
    fontSize: 15,
    color: "#9CA3AF",
    fontStyle: "italic" as const,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
  },
  searchButton: {
    backgroundColor: "#6366F1",
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  toolsRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
  },
  toolButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  toolButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#6366F1",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
    marginTop: 20,
  },
  resultsCount: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  sortButton: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6366F1",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateDesc: {
    fontSize: 15,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 22,
  },
  propertiesContainer: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  toolButtonActive: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  toolButtonTextActive: {
    color: "#FFFFFF",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  modalContent: {
    flex: 1,
  },
  filterSection: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  chipActive: {
    borderColor: "#6366F1",
    backgroundColor: "#6366F1",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#374151",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rangeInput: {
    flex: 1,
  },
  rangeLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  rangeTextInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
  },
  rangeSeparator: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 20,
  },
  locationSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  locationSearchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  resetButtonFooter: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  resetButtonFooterText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#374151",
  },
  applyButton: {
    flex: 2,
    backgroundColor: "#6366F1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});

function LandlordDashboard() {
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
    <SafeAreaView style={dashboardStyles.safeArea} edges={["top"]}>
      <ScrollView style={dashboardStyles.container} contentContainerStyle={dashboardStyles.scrollContent}>
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


const dashboardStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#C7D2FE",
  },
  overviewSection: {
    paddingHorizontal: 24,
    marginTop: -16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  quickActionsSection: {
    paddingHorizontal: 24,
    marginTop: 28,
  },
  actionsList: {
    gap: 12,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionCardPrimary: {
    backgroundColor: "#6366F1",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  recentActivitySection: {
    paddingHorizontal: 24,
    marginTop: 28,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 4,
  },
  activityTextBold: {
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  activityTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});

export default function HomeScreen() {
  const { user } = useAuth();

  if (user?.role === "landlord") {
    return <LandlordDashboard />;
  }

  return <TenantHomeScreen />;
}
