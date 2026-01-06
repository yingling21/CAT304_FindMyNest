export type PropertyType = "house" | "apartment" | "studio" | "condo" | "room";

export type FurnishingLevel = "fully_furnished" | "partially_furnished" | "unfurnished";

export type roomType = "single_room" | "master_room" | "shared_room";

export type ApprovalStatus = "approved" | "pending" | "rejected";

export interface Property {
  id: string;
  landlordId: string;
  landlordName: string;
  landlordPhoto?: string;
  landlordVerified: boolean;
  
  propertyType: PropertyType;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  
  size: number;
  bedrooms: number;
  bathrooms: number;
  furnishingLevel: FurnishingLevel;
  roomType?: roomType;
  floorLevel?: number;
  
  monthlyRent: number;
  securityDeposit: number;
  utilitiesDeposit: number;
  minimumRentalPeriod: number;
  availableDate: string;
  approvalStatus: ApprovalStatus;
  
  amenities: any;
  houseRules: any;
  
  photos: {
    id: string;
    url: string;
    isCover: boolean;
  }[];
  
  averageRating: number;
  totalReviews: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface PropertyInsert {
  landlord_id: string;

  propertyType: PropertyType;
  furnishingLevel: FurnishingLevel;

  title: string;
  description: string;
  address: string;

  latitude?: number;
  longitude?: number;

  size: number;
  bedrooms: number;
  bathrooms: number;
  roomType?: roomType;
  floorLevel?: number;

  monthlyRent: number;
  securityDeposit: number;
  utilitiesDeposit: number;
  minimumRentalPeriod: number;

  availableDate: string | null;
  approvalStatus: ApprovalStatus;

  amenities: Record<string, boolean>;
  houseRules: Record<string, any>;
}

export interface PropertyInput extends PropertyInsert {
  photos?: { url: string }[] | string[];
}