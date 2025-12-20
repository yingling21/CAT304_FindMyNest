import type { Rental } from '@/src/types/rental';

export function normalizeRental(row: any): Rental {
  return {
    id: row.id || '',
    propertyId: row.property_id || '',
    propertyTitle: row.property_title || '',
    propertyImage: row.property_image || '',
    propertyAddress: row.property_address || '',
    
    tenantId: row.tenant_id || '',
    landlordId: row.landlord_id || '',
    
    monthlyRent: row.monthly_rent || 0,
    securityDeposit: row.security_deposit || 0,
    
    startDate: row.start_date || '',
    endDate: row.end_date || undefined,
    
    status: row.status || 'active',
    
    hasReview: row.has_review || false,
    
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function normalizeRentals(rows: any[]): Rental[] {
  return rows.map(normalizeRental);
}
