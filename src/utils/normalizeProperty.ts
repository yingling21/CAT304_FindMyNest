import type { Property, PropertyType, roomType, FurnishingLevel, ApprovalStatus } from '@/src/types/property';

export function normalizeProperty(row: any): Property {
  return {
    id: row.property_id || '',
    landlordId: row.landlord_id || '',
    landlordName: row.landlord_name || 'Unknown',
    landlordPhoto: row.landlord_photo || undefined,
    landlordVerified: row.landlord_verified || false,

    propertyType: (row.propertyType || 'apartment') as PropertyType,
    title: row.title || '',
    description: row.description || '',
    address: row.address || '',

    size: Number(row.size) || 0,
    bedrooms: row.bedrooms || 0,
    bathrooms: row.bathrooms || 0,
    furnishingLevel: (row.furnishingLevel || 'unfurnished') as FurnishingLevel,
    roomType: (row.roomType || 'single_room') as roomType,
    floorLevel: row.floorLevel ? Number(row.floorLevel) : undefined, // ADD THIS

    monthlyRent: Number(row.monthlyRent) || 0,
    securityDeposit: Number(row.securityDeposit) || 0,
    utilitiesDeposit: Number(row.utilitiesDeposit) || 0,
    minimumRentalPeriod: row.minimumRentalPeriod || 0,
    availableDate: row.availableDate || new Date().toISOString().split('T')[0],
    approvalStatus: (row.approvalStatus || row.rentalStatus === true ? "approved" : row.rentalStatus === false ? "pending" : "pending") as ApprovalStatus,

    amenities: row.amenities || {},
    houseRules: row.houseRules || {},

    photos: row.photos || [],

    averageRating: Number(row.average_rating) || 0,
    totalReviews: Number(row.total_reviews) || 0,

    latitude: Number(row.latitude) || 0,   // <-- added
    longitude: Number(row.longitude) || 0, // <-- added

    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function normalizeProperties(rows: any[]): Property[] {
  return rows.map(normalizeProperty);
}
