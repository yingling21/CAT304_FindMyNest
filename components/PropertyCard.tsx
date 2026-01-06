import { useFavorites } from "@/contexts/FavoritesContext";
import type { Property } from "@/src/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Bed, Bath, Maximize2, Heart, Users, Ban, Dog, ChefHat, X, CheckCircle2 } from "lucide-react-native";
import SmokingIcon from "@/components/icons/SmokingIcon";
import React from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 48;

type PropertyCardProps = {
  property: Property;
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorite = isFavorite(property.id);

  const handlePress = () => {
    router.push(`/property/${property.id}` as any);
  };

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    toggleFavorite(property.id);
  };

  // Check if property is available now (availableDate is today or in the past)
  const isAvailableNow = () => {
    if (property.approvalStatus !== 'approved') return false;
    if (!property.availableDate) return false;
    try {
      const availableDate = new Date(property.availableDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      availableDate.setHours(0, 0, 0, 0);
      return availableDate <= today;
    } catch {
      return false;
    }
  };

  // Check if availableDate is in the future (after today)
  const isFutureDate = () => {
    if (!property.availableDate) return false;
    try {
      const availableDate = new Date(property.availableDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      availableDate.setHours(0, 0, 0, 0);
      return availableDate > today;
    } catch {
      return false;
    }
  };

  const formatAvailableDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-MY", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Date TBD";
    }
  };

  const available = isAvailableNow();
  const futureDate = isFutureDate();

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: property.photos[0]?.url || 'https://via.placeholder.com/400' }}
          style={styles.image}
          contentFit="cover"
        />
        
        <View style={styles.badges}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
            </Text>
          </View>
          {available ? (
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Available</Text>
            </View>
          ) : futureDate && property.availableDate ? (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableBadgeText}>
                {formatAvailableDate(property.availableDate)}
              </Text>
            </View>
          ) : null}
        </View>

        <Pressable
          style={[styles.favoriteButton, favorite && styles.favoriteButtonActive]}
          onPress={handleFavoritePress}
        >
          <Heart
            size={22}
            color={favorite ? "#FFFFFF" : "#EF4444"}
            fill={favorite ? "#FFFFFF" : "transparent"}
          />
        </Pressable>

        {property.houseRules && (
          <View style={styles.houseRulesOverlay}>
            {property.houseRules.guestsAllowed !== undefined && (
              <View style={styles.ruleIcon}>
                {property.houseRules.guestsAllowed ? (
                  <Users size={14} color="#10B981" />
                ) : (
                  <View style={styles.iconWithBan}>
                    <Users size={14} color="#6B7280" />
                    <Ban size={12} color="#EF4444" style={styles.banOverlay} />
                  </View>
                )}
              </View>
            )}
            {property.houseRules.smokingAllowed !== undefined && (
              <View style={styles.ruleIcon}>
                {property.houseRules.smokingAllowed ? (
                  <SmokingIcon size={14} color="#10B981" />
                ) : (
                  <View style={styles.iconWithBan}>
                    <SmokingIcon size={14} color="#6B7280" />
                    <Ban size={12} color="#EF4444" style={styles.banOverlay} />
                  </View>
                )}
              </View>
            )}
            {property.houseRules.petsAllowed !== undefined && (
              <View style={styles.ruleIcon}>
                {property.houseRules.petsAllowed ? (
                  <Dog size={14} color="#10B981" />
                ) : (
                  <View style={styles.iconWithBan}>
                    <Dog size={14} color="#6B7280" />
                    <Ban size={12} color="#EF4444" style={styles.banOverlay} />
                  </View>
                )}
              </View>
            )}
            {property.houseRules.cooking && (
              <View style={styles.ruleIcon}>
                {property.houseRules.cooking === "allowed" ? (
                  <ChefHat size={14} color="#10B981" />
                ) : property.houseRules.cooking === "light_cooking" ? (
                  <ChefHat size={14} color="#F59E0B" />
                ) : (
                  <View style={styles.iconWithBan}>
                    <ChefHat size={14} color="#6B7280" />
                    <Ban size={12} color="#EF4444" style={styles.banOverlay} />
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {property.title.length > 50 ? property.title.substring(0, 50) + '...' : property.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>RM {property.monthlyRent}</Text>
          <Text style={styles.priceLabel}>/mo</Text>
        </View>

        <Text style={styles.address} numberOfLines={1}>
          📍 {property.address}
        </Text>

        <View style={styles.specs}>
          <View style={styles.specItem}>
            <Bed size={16} color="#6B7280" />
            <Text style={styles.specText}>{property.bedrooms} Bed</Text>
          </View>
          <View style={styles.specItem}>
            <Bath size={16} color="#6B7280" />
            <Text style={styles.specText}>{property.bathrooms} Bath</Text>
          </View>
          <View style={styles.specItem}>
            <Maximize2 size={16} color="#6B7280" />
            <Text style={styles.specText}>{property.size} sqft</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specText}>
              {property.furnishingLevel === "fully_furnished"
                ? "Unfurnished"
                : property.furnishingLevel === "partially_furnished"
                ? "Partially Furnished"
                : "Fully Furnished"}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: 200,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badges: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    gap: 8,
  },
  typeBadge: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  statusBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  unavailableBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unavailableBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButtonActive: {
    backgroundColor: "#EF4444",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#6366F1",
  },
  priceLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    marginLeft: 4,
  },
  address: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  specs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  specText: {
    fontSize: 13,
    color: "#6B7280",
  },
  houseRulesOverlay: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  ruleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWithBan: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  banOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
