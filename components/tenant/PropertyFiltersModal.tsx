import React from "react";
import { View, Text, Modal, Pressable, ScrollView, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, MapPin } from "lucide-react-native";
import type { PropertyType, FurnishingLevel } from "@/src/types";

type AmenityFilter = {
  airConditioning: boolean;
  wifi: boolean;
  parking: boolean;
  kitchenAccess: boolean;
  washingMachine: boolean;
  security: boolean;
};

export type Filters = {
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

type Props = {
  visible: boolean;
  filters: Filters;
  onClose: () => void;
  onFiltersChange: (filters: Filters) => void;
  onReset: () => void;
};

export default function PropertyFiltersModal({ 
  visible, 
  filters, 
  onClose, 
  onFiltersChange, 
  onReset 
}: Props) {
  const setFilters = (updates: Partial<Filters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const togglePropertyType = (type: PropertyType) => {
    setFilters({
      propertyTypes: filters.propertyTypes.includes(type)
        ? filters.propertyTypes.filter((t) => t !== type)
        : [...filters.propertyTypes, type],
    });
  };

  const toggleFurnishing = (level: FurnishingLevel) => {
    setFilters({
      furnishing: filters.furnishing.includes(level)
        ? filters.furnishing.filter((l) => l !== level)
        : [...filters.furnishing, level],
    });
  };

  const toggleAmenity = (amenity: keyof AmenityFilter) => {
    setFilters({
      amenities: {
        ...filters.amenities,
        [amenity]: !filters.amenities[amenity],
      },
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer} edges={["top", "bottom"]}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose}>
            <X size={24} color="#1F2937" />
          </Pressable>
          <Text style={styles.modalTitle}>Filters</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Property Type</Text>
            <View style={styles.chipContainer}>
              {(["house", "apartment", "studio", "room"] as PropertyType[]).map((type) => (
                <Pressable
                  key={type}
                  style={[styles.chip, filters.propertyTypes.includes(type) && styles.chipActive]}
                  onPress={() => togglePropertyType(type)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      filters.propertyTypes.includes(type) && styles.chipTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </Pressable>
              ))}
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
                  onChangeText={(text) => setFilters({ priceMin: text })}
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
                  onChangeText={(text) => setFilters({ priceMax: text })}
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
                  onChangeText={(text) => setFilters({ sizeMin: text })}
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
                  onChangeText={(text) => setFilters({ sizeMax: text })}
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
                  style={[styles.chip, filters.bedrooms === num && styles.chipActive]}
                  onPress={() =>
                    setFilters({ bedrooms: filters.bedrooms === num ? null : num })
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
                  style={[styles.chip, filters.bathrooms === num && styles.chipActive]}
                  onPress={() =>
                    setFilters({ bathrooms: filters.bathrooms === num ? null : num })
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
                ["fully_furnished", "partially_furnished", "unfurnished"] as FurnishingLevel[]
              ).map((level) => (
                <Pressable
                  key={level}
                  style={[styles.chip, filters.furnishing.includes(level) && styles.chipActive]}
                  onPress={() => toggleFurnishing(level)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      filters.furnishing.includes(level) && styles.chipTextActive,
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
                <Text
                  style={[
                    styles.chipText,
                    filters.amenities.airConditioning && styles.chipTextActive,
                  ]}
                >
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
                <Text
                  style={[styles.chipText, filters.amenities.parking && styles.chipTextActive]}
                >
                  Parking
                </Text>
              </Pressable>
              <Pressable
                style={[styles.chip, filters.amenities.kitchenAccess && styles.chipActive]}
                onPress={() => toggleAmenity("kitchenAccess")}
              >
                <Text
                  style={[
                    styles.chipText,
                    filters.amenities.kitchenAccess && styles.chipTextActive,
                  ]}
                >
                  Kitchen
                </Text>
              </Pressable>
              <Pressable
                style={[styles.chip, filters.amenities.washingMachine && styles.chipActive]}
                onPress={() => toggleAmenity("washingMachine")}
              >
                <Text
                  style={[
                    styles.chipText,
                    filters.amenities.washingMachine && styles.chipTextActive,
                  ]}
                >
                  Washing Machine
                </Text>
              </Pressable>
              <Pressable
                style={[styles.chip, filters.amenities.security && styles.chipActive]}
                onPress={() => toggleAmenity("security")}
              >
                <Text
                  style={[styles.chipText, filters.amenities.security && styles.chipTextActive]}
                >
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
                onChangeText={(text) => setFilters({ location: text })}
                placeholderTextColor="#9CA3AF"
              />
              {filters.location.length > 0 && (
                <Pressable onPress={() => setFilters({ location: "" })}>
                  <X size={18} color="#9CA3AF" />
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <Pressable style={styles.resetButtonFooter} onPress={onReset}>
            <Text style={styles.resetButtonFooterText}>Reset</Text>
          </Pressable>
          <Pressable style={styles.applyButton} onPress={onClose}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
