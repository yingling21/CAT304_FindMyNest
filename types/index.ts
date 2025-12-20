export type UserRole = "tenant" | "landlord";

export type VerificationStatus = "pending" | "approved" | "rejected";

export type User = {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  avatarUrl?: string;
  verificationStatus: VerificationStatus;
  identityDocument?: string;
  ownershipDocument?: string;
  createdAt: string;
};

export type PropertyType = "house" | "apartment" | "studio" | "condo" | "room";

export type FurnishingLevel = "fully_furnished" | "partially_furnished" | "unfurnished";

export type Property = {
  id: string;
  landlordId: string;
  landlordName: string;
  landlordPhoto?: string;
  landlordVerified: boolean;
  
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
