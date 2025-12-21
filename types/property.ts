/* =========================
   ENUM / UNION TYPES
   ========================= */

export type PropertyType = "house" | "apartment" | "studio" | "room";

export type FurnishingLevel =
  | "fully_furnished"
  | "partially_furnished"
  | "unfurnished";

export type CookingPolicy = "allowed" | "light_cooking" | "no_cooking";

/* =========================
   DATABASE ROW (SUPABASE)
   ========================= */

export type PropertyRow = {
  property_id: number;
  landlord_id: number;

  propertyType: PropertyType;
  description: string;
  address: string;

  size: number;
  bedrooms: number;
  bathrooms: number;
  furnishingLevel: FurnishingLevel;

  monthlyRent: number;
  securityDeposit: number;
  utilitiesDeposit: number;
  minimumRentalPeriod: number;
  moveInDate: string;

  rentalStatus: boolean; // true = available, false = occupied

  amenities: {
    deskAndChair?: boolean;
    wardrobe?: boolean;
    airConditioning?: boolean;
    waterHeater?: boolean;
    wifi?: boolean;
    kitchenAccess?: boolean;
    washingMachine?: boolean;
    refrigerator?: boolean;
    parking?: boolean;
    security?: boolean;
    balcony?: boolean;
  };

  houseRules: {
    cooking?: CookingPolicy;
    guestsAllowed?: boolean;
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
  };

  created_at: string;
  updated_at: string;
};

/* =========================
   FRONTEND DOMAIN MODEL
   ========================= */

export type Property = {
  id: string;
  landlordId: string;

  propertyType: PropertyType;
  description: string;
  address: string;

  size: number;
  bedrooms: number;
  bathrooms: number;
  furnishingLevel: FurnishingLevel;

  monthlyRent: number;
  securityDeposit: number;
  utilitiesDeposit: number;
  minimumRentalPeriod: number;
  moveInDate: string;

  rentalStatus: "available" | "occupied";

  amenities: PropertyRow["amenities"];
  houseRules: PropertyRow["houseRules"];

  createdAt: string;
  updatedAt: string;
};

