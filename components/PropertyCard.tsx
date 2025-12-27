import { useFavorites } from "@/contexts/FavoritesContext";
import type { Property } from "@/src/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Bed, Bath, Maximize2, Heart } from "lucide-react-native";
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
          {property.rentalStatus && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Available Now</Text>
            </View>
          )}
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
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {property.description.length > 50 ? property.description.substring(0, 50) + '...' : property.description}
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
});
