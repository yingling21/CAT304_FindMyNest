import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback } from "react";
import type { Review } from "@/src/types";
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

  // Load reviews based on user role
  const loadReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        setReviews([]);
        return;
      }

      if (user.role === 'landlord') {
        const landlordId = user.id;

        // Step 1: Get all property IDs owned by this landlord
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('property')
          .select('property_id')
          .eq('landlord_id', landlordId);

        if (propertiesError) {
          console.error('Failed to fetch properties:', propertiesError);
          setReviews([]);
          return;
        }

        const propertyIds = propertiesData?.map(p => p.property_id) || [];
        console.log('Landlord property IDs:', propertyIds);

        // If landlord has no properties, they have no reviews
        if (propertyIds.length === 0) {
          setReviews([]);
          return;
        }

        // Step 3: Fetch reviews for those properties
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .in('property_id', propertyIds)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          console.log('Loaded reviews for landlord:', data.length);

          // Normalize and set reviews
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
      } else if (user.role === 'tenant') {

        // TENANT: Fetch only their own reviews
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('tenant_id', user.id)
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
      }
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createReview = async (
    propertyId: string,
    rentalId: string,
    rating: number,              // Overall rating (1-5)
    locationRating: number,      // Location rating (1-5)
    conditionRating: number,     // Property condition rating (1-5)
    valueRating: number,         // Value for money rating (1-5)
    landlordRating: number,      // Landlord rating (1-5)
    comment: string,             // Optional comment
    rentalStartDate: string,
    rentalEndDate: string
  ): Promise<Review> => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Insert review into database
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

      // Mark rental as reviewed so tenant can't review again
      const { error: rentalError } = await supabase
        .from('rentals')
        .update({ has_review: true })
        .eq('id', rentalId);
      
      if (rentalError) throw rentalError;

      // Create normalized review object
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

      // Update local state
      setReviews(prev => [newReview, ...prev]);
      return newReview;
    } catch (error) {
      console.error("Failed to create review:", error);
      throw error;
    }
  };

  // Get all reviews for a specific property
  const getReviewsByProperty = (propertyId: string) => {
    return reviews.filter(review => review.propertyId === propertyId);
  };

  // Get all reviews submitted by a specific tenant
  const getReviewsByTenant = (tenantId: string) => {
    return reviews.filter(review => review.tenantId === tenantId);
  };

  // Check if a property has been reviewed by the current tenant
  const hasReviewed = (rentalId: string) => {
    return reviews.some(review => review.rentalId === rentalId);
  };

  // Functions returned by the context:
  return {
    reviews,                        // All reviews (filtered by role)
    isLoading,                      // Loading state
    createReview,                   // Submit a new review
    getReviewsByProperty,           // Get reviews for a specific property
    getReviewsByTenant,             // Get reviews by a specific tenant
    hasReviewed,                    // Check if tenant reviewed a rental
  };
});
