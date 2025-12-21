export interface Review {
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
}
