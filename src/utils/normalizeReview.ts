import type { Review } from '@/src/types/review';

export function normalizeReview(row: any): Review {
  return {
    id: row.id || '',
    propertyId: row.property_id || '',
    rentalId: row.rental_id || '',
    tenantId: row.tenant_id || '',
    tenantName: row.tenant_name || '',
    tenantPhoto: row.tenant_photo || undefined,
    tenantVerified: row.tenant_verified || false,
    
    rating: row.rating || 0,
    locationRating: row.location_rating || 0,
    conditionRating: row.condition_rating || 0,
    valueRating: row.value_rating || 0,
    landlordRating: row.landlord_rating || 0,
    
    comment: row.comment || '',
    
    rentalStartDate: row.rental_start_date || '',
    rentalEndDate: row.rental_end_date || '',
    
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function normalizeReviews(rows: any[]): Review[] {
  return rows.map(normalizeReview);
}
