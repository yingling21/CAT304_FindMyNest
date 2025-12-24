import PropertyCard from "@/components/PropertyCard";
import { useAuth } from "@/contexts/AuthContext";
import type { Property } from "@/src/types";
import AffordabilityCalculator from "@/app/affordability-calculator";
import PropertySearchHeader from "@/components/tenant/PropertySearchHeader";
import PropertyFilterTools from "@/components/tenant/PropertyFilterTools";
import PropertyFiltersModal from "@/components/tenant/PropertyFiltersModal";
import type { Filters } from "@/components/tenant/PropertyFiltersModal";

import { Search } from "lucide-react-native";
import React, { useState, useMemo, useEffect } from "react";
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
};

export default function TenantHomeScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setProperties([]);
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch = property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (
        filters.location &&
        !property.address.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.propertyTypes.length > 0 &&
        !filters.propertyTypes.includes(property.propertyType)
      ) {
        return false;
      }

      if (
        filters.priceMin &&
        property.monthlyRent < parseInt(filters.priceMin)
      ) {
        return false;
      }

      if (
        filters.priceMax &&
        property.monthlyRent > parseInt(filters.priceMax)
      ) {
        return false;
      }

      if (filters.sizeMin && property.size < parseInt(filters.sizeMin)) {
        return false;
      }

      if (filters.sizeMax && property.size > parseInt(filters.sizeMax)) {
        return false;
      }

      if (filters.bedrooms && property.bedrooms < filters.bedrooms) {
        return false;
      }

      if (filters.bathrooms && property.bathrooms < filters.bathrooms) {
        return false;
      }

      if (
        filters.furnishing.length > 0 &&
        !filters.furnishing.includes(property.furnishingLevel)
      ) {
        return false;
      }

      if (
        filters.amenities.airConditioning &&
        !property.amenities?.airConditioning
      ) {
        return false;
      }
      if (filters.amenities.wifi && !property.amenities?.wifi) {
        return false;
      }
      if (filters.amenities.parking && !property.amenities?.parking) {
        return false;
      }
      if (
        filters.amenities.kitchenAccess &&
        !property.amenities?.kitchenAccess
      ) {
        return false;
      }
      if (
        filters.amenities.washingMachine &&
        !property.amenities?.washingMachine
      ) {
        return false;
      }
      if (filters.amenities.security && !property.amenities?.security) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filters, properties]);

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
            {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"} found
          </Text>
          <Pressable>
            <Text style={styles.sortButton}>Newest</Text>
          </Pressable>
        </View>

        <View style={styles.propertiesContainer}>
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
