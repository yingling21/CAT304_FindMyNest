import PropertyCard from "@/components/PropertyCard";
import { useAuth } from "@/contexts/AuthContext";
import type { Property } from "@/src/types";
import AffordabilityCalculator from "./affordability-calculator";
import PropertySearchHeader from "@/components/tenant/PropertySearchHeader";
import PropertyFilterTools from "@/components/tenant/PropertyFilterTools";
import PropertyFiltersModal from "@/components/tenant/PropertyFiltersModal";
import type { Filters } from "@/components/tenant/PropertyFiltersModal";

import { Search } from "lucide-react-native";
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tenantHomeStyles as styles } from "@/styles/TenantHomeScreen.styles";

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
  roomTypes: [],
  floorLevelMin: "",
  floorLevelMax: "",
  utilitiesIncluded: null,
  cooking: null,
};

type SortOrder = "newest" | "oldest";

export default function TenantHomeScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadFilteredProperties();
  }, [filters, searchQuery]);

  const loadFilteredProperties = async () => {
    try {
      setLoading(true);
      const { getFilteredProperties } = await import('@/src/api/properties');
      
      // Convert filters to API format
      const apiFilters = {
        location: filters.location || undefined,
        propertyTypes: filters.propertyTypes.length > 0 ? filters.propertyTypes : undefined,
        priceMin: filters.priceMin ? parseInt(filters.priceMin, 10) : undefined,
        priceMax: filters.priceMax ? parseInt(filters.priceMax, 10) : undefined,
        sizeMin: filters.sizeMin ? parseInt(filters.sizeMin, 10) : undefined,
        sizeMax: filters.sizeMax ? parseInt(filters.sizeMax, 10) : undefined,
        bedrooms: filters.bedrooms || undefined,
        bathrooms: filters.bathrooms || undefined,
        furnishing: filters.furnishing.length > 0 ? filters.furnishing : undefined,
        amenities: Object.values(filters.amenities).some(v => v) ? filters.amenities : undefined,
        roomTypes: filters.roomTypes.length > 0 ? filters.roomTypes : undefined,
        floorLevelMin: filters.floorLevelMin ? parseInt(filters.floorLevelMin, 10) : undefined,
        floorLevelMax: filters.floorLevelMax ? parseInt(filters.floorLevelMax, 10) : undefined,
        utilitiesIncluded: filters.utilitiesIncluded !== null ? filters.utilitiesIncluded : undefined,
        cooking: filters.cooking || undefined,
        searchQuery: searchQuery.trim() || undefined,
      };

      const data = await getFilteredProperties(apiFilters);
      setProperties(data);
    } catch (error) {
      console.error('Failed to load filtered properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
        }
  };

  // Sort properties by creation date
  const filteredProperties = useMemo(() => {
    if (properties.length === 0) return properties;
    
    const sorted = [...properties].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      
      // Handle invalid dates
      if (isNaN(dateA) && isNaN(dateB)) return 0;
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  }, [properties, sortOrder]);

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
    if (filters.roomTypes.length > 0) count++;
    if (filters.floorLevelMin || filters.floorLevelMax) count++;
    if (filters.utilitiesIncluded !== null) count++;
    if (filters.cooking) count++;
    return count;
  }, [filters]);

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const handleSortToggle = () => {
    const newSortOrder = sortOrder === "newest" ? "oldest" : "newest";
    setSortOrder(newSortOrder);
    // Scroll to top when sort changes
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView ref={scrollViewRef} style={styles.container} contentContainerStyle={styles.scrollContent}>
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

        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Loading properties...</Text>
          </View>
        ) : (
          <>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"} found
          </Text>
          <Pressable onPress={handleSortToggle}>
            <Text style={styles.sortButton}>{sortOrder === "newest" ? "Newest" : "Oldest"}</Text>
          </Pressable>
        </View>

        <View style={styles.propertiesContainer} key={sortOrder}>
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </View>

        {filteredProperties.length === 0 && (
          <View style={styles.emptyState}>
            <Search size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No Properties Found</Text>
            <Text style={styles.emptyStateDesc}>
              Try adjusting your search or filters to find what you&apos;re looking for.
            </Text>
          </View>
            )}
          </>
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
