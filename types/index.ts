export type UserRole = "tenant" | "landlord";

export type VerificationStatus = "pending" | "approved" | "rejected";

export type User = {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  profilePicture?: string;
  verificationStatus: VerificationStatus;
  identityDocument?: string;
  ownershipDocument?: string;
  createdAt: string;
};

export type PropertyType = "house" | "apartment" | "studio" | "room";

export type RoomType = "master_room" | "single_room" | "shared_room";

export type FurnishingLevel = "fully_furnished" | "partially_furnished" | "unfurnished";

export type RentalStatus = "available" | "reserved" | "occupied";

export type CookingPolicy = "allowed" | "light_cooking" | "no_cooking";

export type Property = {
  id: string;
  landlordId: string;
  landlordName: string;
  landlordPhoto?: string;
  landlordVerified: boolean;
  
  propertyType: PropertyType;
  roomType?: RoomType;
  
  title: string;
  description: string;
  address: string;
  latitude?: number;
  longitude?: number;
  nearbyLandmarks: string[];
  distanceToTransport: string;
  
  size: number;
  bedrooms: number;
  bathrooms: number;
  floorLevel?: number;
  furnishingLevel: FurnishingLevel;
  
  monthlyRent: number;
  securityDeposit: number;
  utilitiesDeposit: number;
  minimumRentalPeriod: number;
  moveInDate: string;
  rentalStatus: RentalStatus;
  
  estimatedMonthlyUtilities?: number;
  utilitiesIncluded: boolean;
  
  amenities: {
    bedType?: string;
    deskAndChair: boolean;
    wardrobe: boolean;
    airConditioning: boolean;
    waterHeater: boolean;
    wifi: boolean;
    kitchenAccess: boolean;
    washingMachine: boolean;
    refrigerator: boolean;
    parking: boolean;
    security: boolean;
    balcony: boolean;
  };
  
  houseRules: {
    cooking: CookingPolicy;
    guestsAllowed: boolean;
    smokingAllowed: boolean;
    petsAllowed: boolean;
    quietHours?: string;
    cleaningRules?: string;
  };
  
  photos: string[];
  
  averageRating: number;
  totalReviews: number;
  
  createdAt: string;
  updatedAt: string;
};

export type Review = {
  id: string;
  propertyId: string;
  rentalId: string;
  tenantId: string;
  tenantName: string;
  tenantPhoto?: string;
  tenantVerified: boolean;
  
  rating: number;
  locationRating: number;
  conditionRating: number;
  valueRating: number;
  landlordRating: number;
  
  comment: string;
  
  rentalStartDate: string;
  rentalEndDate: string;
  
  createdAt: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
};

export type Conversation = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  propertyPrice: number;
  
  tenantId: string;
  tenantName: string;
  tenantPhoto?: string;
  
  landlordId: string;
  landlordName: string;
  landlordPhoto?: string;
  
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  
  createdAt: string;
  updatedAt: string;
};

export type Rental = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  propertyAddress: string;
  
  tenantId: string;
  landlordId: string;
  
  monthlyRent: number;
  securityDeposit: number;
  
  startDate: string;
  endDate?: string;
  
  status: "active" | "completed" | "cancelled";
  
  hasReview?: boolean;
  
  createdAt: string;
};
