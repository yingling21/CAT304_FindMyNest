export interface Rental {
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
}
