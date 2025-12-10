import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";

export const [FavoritesProvider, useFavorites] = createContextHook(() => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const [storedFavorites, storedViewed] = await Promise.all([
        AsyncStorage.getItem("favorites"),
        AsyncStorage.getItem("recentlyViewed"),
      ]);

      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      if (storedViewed) {
        setRecentlyViewed(JSON.parse(storedViewed));
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (propertyId: string) => {
    setFavorites((prevFavorites) => {
      const newFavorites = prevFavorites.includes(propertyId)
        ? prevFavorites.filter((id) => id !== propertyId)
        : [...prevFavorites, propertyId];

      AsyncStorage.setItem("favorites", JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const addToRecentlyViewed = async (propertyId: string) => {
    setRecentlyViewed((prevViewed) => {
      const filtered = prevViewed.filter((id) => id !== propertyId);
      const newViewed = [propertyId, ...filtered].slice(0, 20);

      AsyncStorage.setItem("recentlyViewed", JSON.stringify(newViewed));
      return newViewed;
    });
  };

  const isFavorite = (propertyId: string) => favorites.includes(propertyId);

  return {
    favorites,
    recentlyViewed,
    isLoading,
    toggleFavorite,
    addToRecentlyViewed,
    isFavorite,
  };
});
