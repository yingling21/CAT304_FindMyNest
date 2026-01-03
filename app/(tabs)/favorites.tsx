import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFavorites } from "@/contexts/FavoritesContext";
import { getPropertiesByIds } from "@/src/api/properties";
import type { Property } from "@/src/types/property";
import PropertyCard from "@/components/PropertyCard";

export default function FavoritesScreen() {
  const { favorites, isLoading } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      if (favorites.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      try {
        const data = await getPropertiesByIds(favorites);
        setProperties(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [favorites]);

  if (isLoading || loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favorites</Text>
        </View>
      <View style={styles.center}>
        <Text>Loading favorites...</Text>
      </View>
      </SafeAreaView>
    );
  }

  if (properties.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favorites</Text>
        </View>
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No favorites yet</Text>
        <Text style={styles.emptyText}>
          Tap the ❤️ icon on a property to save it here.
        </Text>
      </View>
      </SafeAreaView>
    );
  }

  // Filter out properties where availableDate is more than one month away
  const filteredProperties = properties.filter((property) => {
    if (property.availableDate) {
      try {
        const availableDate = new Date(property.availableDate);
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
        
        // If availableDate is more than one month away, exclude it
        if (availableDate > oneMonthFromNow) {
          return false;
        }
      } catch {
        // If date parsing fails, include the property
      }
    }
    return true;
  });

  if (filteredProperties.length === 0 && properties.length > 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favorites</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No available favorites</Text>
          <Text style={styles.emptyText}>
            Your favorited properties are not available within the next month.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>
    <FlatList
        data={filteredProperties}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => <PropertyCard property={item} />}
    />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  list: { padding: 16 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});
