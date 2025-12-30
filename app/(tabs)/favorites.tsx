import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
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
      <View style={styles.center}>
        <Text>Loading favorites...</Text>
      </View>
    );
  }

  if (properties.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No favorites yet</Text>
        <Text style={styles.emptyText}>
          Tap the ❤️ icon on a property to save it here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={properties}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => <PropertyCard property={item} />}
    />
  );
}

const styles = StyleSheet.create({
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
