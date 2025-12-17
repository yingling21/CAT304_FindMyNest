import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import type { PropertyType, RoomType, FurnishingLevel } from "@/types";

type FormData = {
  propertyType: PropertyType | "";
  roomType?: RoomType;
  size: string;
  bedrooms: string;
  bathrooms: string;
  floorLevel: string;
  furnishingLevel: FurnishingLevel | "";
};

type Props = {
  formData: FormData;
  onUpdate: (data: Partial<FormData>) => void;
};

export default function BasicDetailsStep({ formData, onUpdate }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Property Details</Text>
      
      <Text style={styles.label}>
        Property Type <Text style={styles.requiredStar}>*</Text>
      </Text>
      <View style={styles.optionsRow}>
        {(["house", "apartment", "studio", "room"] as PropertyType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.optionChip,
              formData.propertyType === type && styles.optionChipSelected,
            ]}
            onPress={() => onUpdate({ propertyType: type })}
          >
            <Text
              style={[
                styles.optionChipText,
                formData.propertyType === type && styles.optionChipTextSelected,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {formData.propertyType === "room" && (
        <>
          <Text style={styles.label}>Room Type</Text>
          <View style={styles.optionsRow}>
            {(["master_room", "single_room", "shared_room"] as RoomType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionChip,
                  formData.roomType === type && styles.optionChipSelected,
                ]}
                onPress={() => onUpdate({ roomType: type })}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    formData.roomType === type && styles.optionChipTextSelected,
                  ]}
                >
                  {type.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={styles.label}>Size (sq ft) <Text style={styles.requiredStar}>*</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="Enter size"
        keyboardType="numeric"
        value={formData.size}
        onChangeText={(text) => onUpdate({ size: text })}
      />

      <Text style={styles.label}>Bedrooms</Text>
      <View style={styles.optionsRow}>
        {["0", "1", "2", "3", "4", "5+"].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.optionChip,
              formData.bedrooms === num && styles.optionChipSelected,
            ]}
            onPress={() => onUpdate({ bedrooms: num })}
          >
            <Text
              style={[
                styles.optionChipText,
                formData.bedrooms === num && styles.optionChipTextSelected,
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Bathrooms</Text>
      <View style={styles.optionsRow}>
        {["1", "2", "3", "4", "5+"].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.optionChip,
              formData.bathrooms === num && styles.optionChipSelected,
            ]}
            onPress={() => onUpdate({ bathrooms: num })}
          >
            <Text
              style={[
                styles.optionChipText,
                formData.bathrooms === num && styles.optionChipTextSelected,
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Floor Level</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Ground floor, 5th floor"
        value={formData.floorLevel}
        onChangeText={(text) => onUpdate({ floorLevel: text })}
      />

      <Text style={styles.label}>Furnishing Level <Text style={styles.requiredStar}>*</Text></Text>
      <View style={styles.optionsRow}>
        {([
          { value: "fully_furnished", label: "Fully Furnished" },
          { value: "partially_furnished", label: "Partially Furnished" },
          { value: "unfurnished", label: "Unfurnished" },
        ] as { value: FurnishingLevel; label: string }[]).map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionChip,
              formData.furnishingLevel === option.value && styles.optionChipSelected,
            ]}
            onPress={() => onUpdate({ furnishingLevel: option.value })}
          >
            <Text
              style={[
                styles.optionChipText,
                formData.furnishingLevel === option.value && styles.optionChipTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#FFFFFF",
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 8,
  },
  requiredStar: {
    color: "#EF4444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#F9FAFB",
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  optionChipSelected: {
    borderColor: "#6366F1",
    backgroundColor: "#EEF2FF",
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  optionChipTextSelected: {
    color: "#6366F1",
    fontWeight: "600" as const,
  },
});
