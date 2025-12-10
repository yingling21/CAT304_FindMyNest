import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback } from "react";
import type { Review } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export const [ReviewsProvider, useReviews] = createContextHook(() => {
  const auth = useAuth();
  const user = auth?.user ?? null;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem("reviews");
      const allReviews: Review[] = stored ? JSON.parse(stored) : [];
      setReviews(allReviews);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createReview = async (
    propertyId: string,
    rentalId: string,
    rating: number,
    locationRating: number,
    conditionRating: number,
    valueRating: number,
    landlordRating: number,
    comment: string,
    rentalStartDate: string,
    rentalEndDate: string
  ): Promise<Review> => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const newReview: Review = {
        id: Date.now().toString(),
        propertyId,
        rentalId,
        tenantId: user.id,
        tenantName: user.fullName,
        tenantPhoto: user.profilePicture,
        tenantVerified: user.verificationStatus === "approved",
        rating,
        locationRating,
        conditionRating,
        valueRating,
        landlordRating,
        comment,
        rentalStartDate,
        rentalEndDate,
        createdAt: new Date().toISOString(),
      };

      const stored = await AsyncStorage.getItem("reviews");
      const allReviews: Review[] = stored ? JSON.parse(stored) : [];
      allReviews.push(newReview);
      await AsyncStorage.setItem("reviews", JSON.stringify(allReviews));

      const rentalStored = await AsyncStorage.getItem("rentals");
      const allRentals = rentalStored ? JSON.parse(rentalStored) : [];
      const updatedRentals = allRentals.map((rental: any) =>
        rental.id === rentalId ? { ...rental, hasReview: true } : rental
      );
      await AsyncStorage.setItem("rentals", JSON.stringify(updatedRentals));

      setReviews(prev => [...prev, newReview]);
      return newReview;
    } catch (error) {
      console.error("Failed to create review:", error);
      throw error;
    }
  };

  const getReviewsByProperty = (propertyId: string) => {
    return reviews.filter(review => review.propertyId === propertyId);
  };

  const getReviewsByTenant = (tenantId: string) => {
    return reviews.filter(review => review.tenantId === tenantId);
  };

  const hasReviewed = (rentalId: string) => {
    return reviews.some(review => review.rentalId === rentalId);
  };

  return {
    reviews,
    isLoading,
    createReview,
    getReviewsByProperty,
    getReviewsByTenant,
    hasReviewed,
  };
});
