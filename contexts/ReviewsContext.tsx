import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback } from "react";
import type { Review } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

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
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setReviews(data.map((review: any) => ({
          id: review.id,
          propertyId: review.property_id,
          rentalId: review.rental_id,
          tenantId: review.tenant_id,
          tenantName: review.tenant_name,
          tenantPhoto: review.tenant_photo,
          tenantVerified: review.tenant_verified,
          rating: review.rating,
          locationRating: review.location_rating,
          conditionRating: review.condition_rating,
          valueRating: review.value_rating,
          landlordRating: review.landlord_rating,
          comment: review.comment,
          rentalStartDate: review.rental_start_date,
          rentalEndDate: review.rental_end_date,
          createdAt: review.created_at,
        })));
      }
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

      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          property_id: propertyId,
          rental_id: rentalId,
          tenant_id: user.id,
          tenant_name: user.fullName,
          tenant_photo: user.avatarUrl,
          tenant_verified: user.verificationStatus === "approved",
          rating,
          location_rating: locationRating,
          condition_rating: conditionRating,
          value_rating: valueRating,
          landlord_rating: landlordRating,
          comment,
          rental_start_date: rentalStartDate,
          rental_end_date: rentalEndDate,
        })
        .select()
        .single();
      
      if (reviewError) throw reviewError;

      const { error: rentalError } = await supabase
        .from('rentals')
        .update({ has_review: true })
        .eq('id', rentalId);
      
      if (rentalError) throw rentalError;

      const newReview: Review = {
        id: reviewData.id,
        propertyId: reviewData.property_id,
        rentalId: reviewData.rental_id,
        tenantId: reviewData.tenant_id,
        tenantName: reviewData.tenant_name,
        tenantPhoto: reviewData.tenant_photo,
        tenantVerified: reviewData.tenant_verified,
        rating: reviewData.rating,
        locationRating: reviewData.location_rating,
        conditionRating: reviewData.condition_rating,
        valueRating: reviewData.value_rating,
        landlordRating: reviewData.landlord_rating,
        comment: reviewData.comment,
        rentalStartDate: reviewData.rental_start_date,
        rentalEndDate: reviewData.rental_end_date,
        createdAt: reviewData.created_at,
      };

      setReviews(prev => [newReview, ...prev]);
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
