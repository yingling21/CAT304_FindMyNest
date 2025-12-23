export type PropertyType = "house" | "apartment" | "studio" | "condo" | "room";

export type FurnishingLevel = "fully_furnished" | "partially_furnished" | "unfurnished";

export interface Property {
  id: string;
  landlordId: string;
  landlordName: string;
  landlordPhoto?: string;
  landlordVerified: boolean;
  
  propertyType: PropertyType;
  title?: string;
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
