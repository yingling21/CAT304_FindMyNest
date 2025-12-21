import type { PropertyRow, Property } from "@/types/property";

export function normalizeProperty(row: PropertyRow): Property {
  return {
    id: String(row.property_id),
    landlordId: String(row.landlord_id),

    propertyType: row.propertyType,
    description: row.description,
    address: row.address,

    size: row.size,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    furnishingLevel: row.furnishingLevel,

    monthlyRent: row.monthlyRent,
    securityDeposit: row.securityDeposit,
    utilitiesDeposit: row.utilitiesDeposit,
    minimumRentalPeriod: row.minimumRentalPeriod,
    moveInDate: row.moveInDate,

    rentalStatus: row.rentalStatus ? "available" : "occupied",

    amenities: row.amenities ?? {},
    houseRules: row.houseRules ?? {},

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
