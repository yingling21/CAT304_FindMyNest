import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SlidersHorizontal, Calculator, MapPin } from "lucide-react-native";

type Props = {
  activeFiltersCount: number;
  onFilterPress: () => void;
  onCalculatorPress: () => void;
};

export default function PropertyFilterTools({ 
  activeFiltersCount, 
  onFilterPress, 
  onCalculatorPress 
}: Props) {
  return (
    <View style={styles.toolsRow}>
      <Pressable 
        style={[styles.toolButton, activeFiltersCount > 0 && styles.toolButtonActive]}
        onPress={onFilterPress}
      >
        <SlidersHorizontal size={20} color={activeFiltersCount > 0 ? "#FFFFFF" : "#6366F1"} />
        <Text style={[styles.toolButtonText, activeFiltersCount > 0 && styles.toolButtonTextActive]}>
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Text>
      </Pressable>

      <Pressable style={styles.toolButton} onPress={onCalculatorPress}>
        <Calculator size={20} color="#6366F1" />
        <Text style={styles.toolButtonText}>Calculator</Text>
      </Pressable>

      <Pressable style={styles.toolButton}>
        <MapPin size={20} color="#6366F1" />
        <Text style={styles.toolButtonText}>Map</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
  toolButtonActive: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  toolButtonTextActive: {
    color: "#FFFFFF",
  },
});
