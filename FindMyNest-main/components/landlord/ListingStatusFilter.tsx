import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";

type ListingStatus = "all" | "approved" | "pending" | "rejected";

type Props = {
  selectedStatus: ListingStatus;
  onStatusChange: (status: ListingStatus) => void;
  counts: {
    all: number;
    approved: number;
    pending: number;
    rejected: number;
  };
};

export default function ListingStatusFilter({ selectedStatus, onStatusChange, counts }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedStatus === "all" && styles.filterButtonActive]}
          onPress={() => onStatusChange("all")}
        >
          <Text
            style={[
              styles.filterText,
              selectedStatus === "all" && styles.filterTextActive,
            ]}
          >
            All ({counts.all})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === "approved" && styles.filterButtonActive,
          ]}
          onPress={() => onStatusChange("approved")}
        >
          <Text
            style={[
              styles.filterText,
              selectedStatus === "approved" && styles.filterTextActive,
            ]}
          >
            Approved ({counts.approved})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === "pending" && styles.filterButtonActive,
          ]}
          onPress={() => onStatusChange("pending")}
        >
          <Text
            style={[
              styles.filterText,
              selectedStatus === "pending" && styles.filterTextActive,
            ]}
          >
            Pending ({counts.pending})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === "rejected" && styles.filterButtonActive,
          ]}
          onPress={() => onStatusChange("rejected")}
        >
          <Text
            style={[
              styles.filterText,
              selectedStatus === "rejected" && styles.filterTextActive,
            ]}
          >
            Rejected ({counts.rejected})
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  filterButtonActive: {
    backgroundColor: "#6366F1",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
});
