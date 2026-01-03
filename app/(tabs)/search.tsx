import PropertyCard from "@/components/PropertyCard";
import type { PropertyType, FurnishingLevel, Property } from "@/src/types";
import { Stack } from "expo-router";
import {
  MapPin,
  SlidersHorizontal,
  Search,
  X,
} from "lucide-react-native";
import React, { useState, useMemo } from "react";
import {
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { searchStyles as styles } from "@/styles/tabs";

type AmenityFilter = {
  airConditioning: boolean;
  wifi: boolean;
  parking: boolean;
  kitchenAccess: boolean;
  washingMachine: boolean;
  security: boolean;
};

type Filters = {
  location: string;
  propertyTypes: PropertyType[];
  priceMin: string;
  priceMax: string;
  sizeMin: string;
  sizeMax: string;
  bedrooms: number | null;
  bathrooms: number | null;
  furnishing: FurnishingLevel[];
  amenities: AmenityFilter;
};

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

type SortOption = "newest" | "price_low" | "price_high";

export default function SearchScreen() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadFilteredProperties();
  }, [filters]);

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
    
  // Properties are already filtered from the database, just sort them
  const filteredAndSortedProperties = useMemo(() => {
    let results = [...properties];

    if (sortBy === "price_low") {
      results = results.sort((a, b) => a.monthlyRent - b.monthlyRent);
    } else if (sortBy === "price_high") {
      results = results.sort((a, b) => b.monthlyRent - a.monthlyRent);
    } else {
      results = results.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return results;
  }, [properties, sortBy]);

  const togglePropertyType = (type: PropertyType) => {
    setFilters((prev) => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter((t) => t !== type)
        : [...prev.propertyTypes, type],
    }));
  };

  const toggleFurnishing = (level: FurnishingLevel) => {
    setFilters((prev) => ({
      ...prev,
      furnishing: prev.furnishing.includes(level)
        ? prev.furnishing.filter((l) => l !== level)
        : [...prev.furnishing, level],
    }));
  };

  const toggleAmenity = (amenity: keyof AmenityFilter) => {
    setFilters((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: !prev.amenities[amenity],
      },
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

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

  return (
    <>
      <Stack.Screen
        options={{
          title: "Search Properties",
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <View style={styles.container}>
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Search size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by location (e.g., Penang, Bayan Lepas)"
                value={filters.location}
                onChangeText={(text) =>
                  setFilters((prev) => ({ ...prev, location: text }))
                }
                placeholderTextColor="#9CA3AF"
              />
              {filters.location.length > 0 && (
                <Pressable onPress={() => setFilters((prev) => ({ ...prev, location: "" }))}>
                  <X size={20} color="#9CA3AF" />
                </Pressable>
              )}
            </View>

            <View style={styles.actionRow}>
              <Pressable
                style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
                onPress={() => setShowFilters(true)}
              >
                <SlidersHorizontal size={20} color={activeFiltersCount > 0 ? "#FFFFFF" : "#6366F1"} />
                <Text style={[styles.filterButtonText, activeFiltersCount > 0 && styles.filterButtonTextActive]}>
                  Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </Text>
              </Pressable>

              <View style={styles.sortContainer}>
                <Text style={styles.sortLabel}>Sort:</Text>
                <Pressable
                  style={styles.sortButton}
                  onPress={() => {
                    if (sortBy === "newest") setSortBy("price_low");
                    else if (sortBy === "price_low") setSortBy("price_high");
                    else setSortBy("newest");
                  }}
                >
                  <Text style={styles.sortButtonText}>
                    {sortBy === "newest" && "Newest"}
                    {sortBy === "price_low" && "Price: Low to High"}
                    {sortBy === "price_high" && "Price: High to Low"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <Text style={styles.resultsText}>
            {loading ? "Loading..." : `${filteredAndSortedProperties.length} properties found`}
          </Text>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Loading properties...</Text>
              </View>
            ) : (
              <>
            {filteredAndSortedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}

            {filteredAndSortedProperties.length === 0 && (
              <View style={styles.emptyState}>
                <MapPin size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No properties found</Text>
                <Text style={styles.emptySubtitle}>
                  Try adjusting your filters to see more results
                </Text>
              </View>
                )}
              </>
            )}
          </ScrollView>
        </View>

        <Modal
          visible={showFilters}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowFilters(false)}
        >
          <SafeAreaView style={styles.modalContainer} edges={["top", "bottom"]}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowFilters(false)}>
                <X size={24} color="#1F2937" />
              </Pressable>
              <Text style={styles.modalTitle}>Filters</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Property Type</Text>
                <View style={styles.chipContainer}>
                  {(["house", "apartment", "studio", "room"] as PropertyType[]).map(
                    (type) => (
                      <Pressable
                        key={type}
                        style={[
                          styles.chip,
                          filters.propertyTypes.includes(type) && styles.chipActive,
                        ]}
                        onPress={() => togglePropertyType(type)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            filters.propertyTypes.includes(type) &&
                              styles.chipTextActive,
                          ]}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                      </Pressable>
                    )
                  )}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Price Range (RM/month)</Text>
                <View style={styles.rangeRow}>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Minimum</Text>
                    <TextInput
                      style={styles.rangeTextInput}
                      placeholder="0"
                      value={filters.priceMin}
                      onChangeText={(text) =>
                        setFilters((prev) => ({ ...prev, priceMin: text }))
                      }
                      keyboardType="numeric"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <Text style={styles.rangeSeparator}>-</Text>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Maximum</Text>
                    <TextInput
                      style={styles.rangeTextInput}
                      placeholder="No limit"
                      value={filters.priceMax}
                      onChangeText={(text) =>
                        setFilters((prev) => ({ ...prev, priceMax: text }))
                      }
                      keyboardType="numeric"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Size Range (sq ft)</Text>
                <View style={styles.rangeRow}>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Minimum</Text>
                    <TextInput
                      style={styles.rangeTextInput}
                      placeholder="0"
                      value={filters.sizeMin}
                      onChangeText={(text) =>
                        setFilters((prev) => ({ ...prev, sizeMin: text }))
                      }
                      keyboardType="numeric"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <Text style={styles.rangeSeparator}>-</Text>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Maximum</Text>
                    <TextInput
                      style={styles.rangeTextInput}
                      placeholder="No limit"
                      value={filters.sizeMax}
                      onChangeText={(text) =>
                        setFilters((prev) => ({ ...prev, sizeMax: text }))
                      }
                      keyboardType="numeric"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Bedrooms</Text>
                <View style={styles.chipContainer}>
                  {[1, 2, 3, 4].map((num) => (
                    <Pressable
                      key={num}
                      style={[
                        styles.chip,
                        filters.bedrooms === num && styles.chipActive,
                      ]}
                      onPress={() =>
                        setFilters((prev) => ({
                          ...prev,
                          bedrooms: prev.bedrooms === num ? null : num,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.chipText,
                          filters.bedrooms === num && styles.chipTextActive,
                        ]}
                      >
                        {num}+
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Bathrooms</Text>
                <View style={styles.chipContainer}>
                  {[1, 2, 3, 4].map((num) => (
                    <Pressable
                      key={num}
                      style={[
                        styles.chip,
                        filters.bathrooms === num && styles.chipActive,
                      ]}
                      onPress={() =>
                        setFilters((prev) => ({
                          ...prev,
                          bathrooms: prev.bathrooms === num ? null : num,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.chipText,
                          filters.bathrooms === num && styles.chipTextActive,
                        ]}
                      >
                        {num}+
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Furnishing</Text>
                <View style={styles.chipContainer}>
                  {(
                    [
                      "fully_furnished",
                      "partially_furnished",
                      "unfurnished",
                    ] as FurnishingLevel[]
                  ).map((level) => (
                    <Pressable
                      key={level}
                      style={[
                        styles.chip,
                        filters.furnishing.includes(level) && styles.chipActive,
                      ]}
                      onPress={() => toggleFurnishing(level)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          filters.furnishing.includes(level) &&
                            styles.chipTextActive,
                        ]}
                      >
                        {level === "fully_furnished"
                          ? "Fully"
                          : level === "partially_furnished"
                          ? "Partially"
                          : "Unfurnished"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Amenities</Text>
                <View style={styles.chipContainer}>
                  <Pressable
                    style={[styles.chip, filters.amenities.airConditioning && styles.chipActive]}
                    onPress={() => toggleAmenity("airConditioning")}
                  >
                    <Text style={[styles.chipText, filters.amenities.airConditioning && styles.chipTextActive]}>
                      Air Conditioning
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.chip, filters.amenities.wifi && styles.chipActive]}
                    onPress={() => toggleAmenity("wifi")}
                  >
                    <Text style={[styles.chipText, filters.amenities.wifi && styles.chipTextActive]}>
                      WiFi
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.chip, filters.amenities.parking && styles.chipActive]}
                    onPress={() => toggleAmenity("parking")}
                  >
                    <Text style={[styles.chipText, filters.amenities.parking && styles.chipTextActive]}>
                      Parking
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.chip, filters.amenities.kitchenAccess && styles.chipActive]}
                    onPress={() => toggleAmenity("kitchenAccess")}
                  >
                    <Text style={[styles.chipText, filters.amenities.kitchenAccess && styles.chipTextActive]}>
                      Kitchen
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.chip, filters.amenities.washingMachine && styles.chipActive]}
                    onPress={() => toggleAmenity("washingMachine")}
                  >
                    <Text style={[styles.chipText, filters.amenities.washingMachine && styles.chipTextActive]}>
                      Washing Machine
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.chip, filters.amenities.security && styles.chipActive]}
                    onPress={() => toggleAmenity("security")}
                  >
                    <Text style={[styles.chipText, filters.amenities.security && styles.chipTextActive]}>
                      Security
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Location</Text>
                <View style={styles.locationSearchContainer}>
                  <MapPin size={18} color="#9CA3AF" />
                  <TextInput
                    style={styles.locationSearchInput}
                    placeholder="Search by city or area..."
                    value={filters.location}
                    onChangeText={(text) => setFilters(prev => ({ ...prev, location: text }))}
                    placeholderTextColor="#9CA3AF"
                  />
                  {filters.location.length > 0 && (
                    <Pressable onPress={() => setFilters(prev => ({ ...prev, location: "" }))}>
                      <X size={18} color="#9CA3AF" />
                    </Pressable>
                  )}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.resetButtonFooter}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonFooterText}>Reset</Text>
              </Pressable>
              <Pressable
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </>
  );
}


