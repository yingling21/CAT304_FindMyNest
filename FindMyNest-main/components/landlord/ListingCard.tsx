import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { CheckCircle, Clock, XCircle, Eye, Edit2, Trash2 } from "lucide-react-native";
import { useRouter } from "expo-router";

type ListingProperty = {
  id: string;
  landlordId: string;
  title: string;
  image: string;
  price: number;
  address: string;
  status: "approved" | "pending" | "rejected";
  views: number;
  messages: number;
  createdAt: string;
};

type Props = {
  property: ListingProperty;
};

export default function ListingCard({ property }: Props) {
  const router = useRouter();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={14} color="#FFFFFF" />;
      case "pending":
        return <Clock size={14} color="#FFFFFF" />;
      case "rejected":
        return <XCircle size={14} color="#FFFFFF" />;
      default:
        return null;
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "approved":
        return styles.statusBadgeApproved;
      case "pending":
        return styles.statusBadgePending;
      case "rejected":
        return styles.statusBadgeRejected;
      default:
        return styles.statusBadgePending;
    }
  };

  return (
    <View style={styles.propertyCard}>
      <View>
        <Image source={{ uri: property.image }} style={styles.propertyImage} resizeMode="cover" />
        <View style={[styles.statusBadge, getStatusBadgeStyle(property.status)]}>
          {getStatusIcon(property.status)}
          <Text style={styles.statusText}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle}>{property.title}</Text>
        <Text style={styles.propertyAddress}>{property.address}</Text>
        <Text style={styles.propertyPrice}>RM {property.price}/month</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Views</Text>
            <Text style={styles.statValue}>{property.views}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Messages</Text>
            <Text style={styles.statValue}>{property.messages}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Listed</Text>
            <Text style={styles.statValue}>
              {new Date(property.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/property/${property.id}`)}
          >
            <Eye size={16} color="#6B7280" />
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() => router.push(`/edit-listing/${property.id}` as any)}
          >
            <Edit2 size={16} color="#FFFFFF" />
            <Text style={[styles.actionButtonText, { color: "#FFFFFF" }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log("Delete", property.id)}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  propertyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  propertyImage: {
    width: "100%",
    height: 180,
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusBadgeApproved: {
    backgroundColor: "rgba(16, 185, 129, 0.9)",
  },
  statusBadgePending: {
    backgroundColor: "rgba(251, 146, 60, 0.9)",
  },
  statusBadgeRejected: {
    backgroundColor: "rgba(239, 68, 68, 0.9)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  propertyInfo: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#6366F1",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  actionButtonPrimary: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
});
