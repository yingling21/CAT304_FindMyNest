/* =========================
   ENUM / UNION TYPES
   ========================= */

export type PropertyType = "house" | "apartment" | "studio" | "room";

export type FurnishingLevel =
  | "fully_furnished"
  | "partially_furnished"
  | "unfurnished";

export type CookingPolicy = "allowed" | "light_cooking" | "no_cooking";

export type PropertyAmenities = {
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

export type PropertyHouseRules = {
  cooking?: CookingPolicy;
  guestsAllowed?: boolean;
  smokingAllowed?: boolean;
  petsAllowed?: boolean;
};

/* =========================
   DATABASE ROW (SUPABASE)
   ========================= */

export type PropertyRow = {
  property_id: string;
  landlord_id: string;

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

  rentalStatus: boolean;

  amenities?: PropertyAmenities;
  houseRules?: PropertyHouseRules;

  created_at: string;
  updated_at: string;

  landlord?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    verified: boolean;
  };

  property_Photo?: {
    photo_id: number;
    photo_url: string;
    is_cover: boolean;
  }[];
};

export type Property = {
  id: string;

  landlord?: {
    id: string;
    name: string;
    photo: string | null;
    verified: boolean;
  };

  photos: string[];

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

  amenities: PropertyAmenities;
  houseRules: PropertyHouseRules;

  createdAt: string;
  updatedAt: string;
};
