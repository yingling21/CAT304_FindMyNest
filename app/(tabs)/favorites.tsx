import PropertyCard from "@/components/PropertyCard";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Heart } from "lucide-react-native";
import type { Property } from "@/src/types";
import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { favoritesStyles as styles } from "@/styles/tabs";

export default function FavoritesScreen() {
  const { favorites } = useFavorites();

  const favoriteProperties = useMemo(() => {
    const properties: Property[] = [];
    return properties.filter((property) => favorites.includes(property.id));
  }, [favorites]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
        <Text style={styles.headerSubtitle}>
          {favoriteProperties.length} {favoriteProperties.length === 1 ? "property" : "properties"} saved
        </Text>
      </View>

      {favoriteProperties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.iconContainer}>
            <Heart size={64} color="#EF4444" fill="#FEE2E2" />
          </View>
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start exploring and save properties you love by tapping the heart icon
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {favoriteProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}


