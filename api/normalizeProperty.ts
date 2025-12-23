import type { PropertyRow, Property } from "@/types/property";

export function normalizeProperty(row: PropertyRow): Property {
  return {
    id: row.property_id,

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

    photos:
      row.property_Photo
        ?.sort((a, b) => Number(b.is_cover) - Number(a.is_cover))
        .map(photo => photo.photo_url) ?? [],

    landlord: row.landlord
      ? {
          id: row.landlord.id,
          name: row.landlord.full_name,
          photo: row.landlord.avatar_url,
          verified: row.landlord.verified,
        }
      : undefined,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
