import type { Property, PropertyType, FurnishingLevel } from '@/src/types/property';

export function normalizeProperty(row: any): Property {
  return {
    id: row.property_id?.toString() || '',
    landlordId: row.landlord_id?.toString() || '',
    landlordName: row.landlord_name || 'Unknown',
    landlordPhoto: row.landlord_photo || undefined,
    landlordVerified: row.landlord_verified || false,
    
    propertyType: (row.propertyType || 'apartment') as PropertyType,
    description: row.description || '',
    address: row.address || '',
    
    size: Number(row.size) || 0,
    bedrooms: row.bedrooms || 0,
    bathrooms: row.bathrooms || 0,
    furnishingLevel: (row.furnishingLevel || 'unfurnished') as FurnishingLevel,
    
    monthlyRent: Number(row.monthlyRent) || 0,
    securityDeposit: Number(row.securityDeposit) || 0,
    utilitiesDeposit: Number(row.utilitiesDeposit) || 0,
    minimumRentalPeriod: row.minimumRentalPeriod || 0,
    moveInDate: row.moveInDate || new Date().toISOString().split('T')[0],
    rentalStatus: row.rentalStatus !== false,
    
    amenities: row.amenities || {},
    houseRules: row.houseRules || {},
    
    photos: row.photos || [],
    
    averageRating: Number(row.average_rating) || 0,
    totalReviews: Number(row.total_reviews) || 0,
    
    createdAt: row.created_At || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function normalizeProperties(rows: any[]): Property[] {
  return rows.map(normalizeProperty);
}
