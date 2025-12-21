import { supabase } from '@/lib/supabase';
import type { Review } from '@/src/types/review';
import { normalizeReview, normalizeReviews } from '@/src/utils/normalizeReview';

export async function getReviewsByProperty(propertyId: string): Promise<Review[]> {
  const propertyIdNum = parseInt(propertyId);
  
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('property_id', propertyIdNum)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch reviews:', error);
    throw error;
  }

  return normalizeReviews(data || []);
}

export async function getReviewsByTenant(tenantId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch reviews:', error);
    throw error;
  }

  return normalizeReviews(data || []);
}

export async function createReview(reviewData: Partial<Review>): Promise<Review> {
  const propertyIdNum = parseInt(reviewData.propertyId || '0');
  
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      property_id: propertyIdNum,
      rental_id: reviewData.rentalId,
      tenant_id: reviewData.tenantId,
      tenant_name: reviewData.tenantName || '',
      tenant_photo: reviewData.tenantPhoto,
      tenant_verified: reviewData.tenantVerified || false,
      rating: reviewData.rating,
      location_rating: reviewData.locationRating,
      condition_rating: reviewData.conditionRating,
      value_rating: reviewData.valueRating,
      landlord_rating: reviewData.landlordRating,
      comment: reviewData.comment,
      rental_start_date: reviewData.rentalStartDate,
      rental_end_date: reviewData.rentalEndDate,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create review:', error);
    throw error;
  }

  return normalizeReview(data);
}
