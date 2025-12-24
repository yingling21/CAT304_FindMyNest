export interface Rental {
  id: string;
  propertyId: string;
  propertyAddress: string;
  propertyImage: string;
  
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
