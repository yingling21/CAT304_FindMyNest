export type PaymentType = "initial" | "recurring";
export type PaymentStatus = "pending" | "success" | "failed";

export interface Payment {
  id: string;
  rentalId: string;
  propertyId: string;
  
  tenantId: string;
  landlordId: string;
  
  paymentType: PaymentType;
  amount: number;
  
  monthlyRent: number;
  securityDeposit: number;
  utilitiesDeposit: number;
  
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  
  paymentDate?: string;
  dueDate?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface CreatePaymentParams {
  rentalId: string;
  propertyId: string;
  landlordId: string;
  paymentType: PaymentType;
  amount: number;
  monthlyRent: number;
  securityDeposit?: number;
  utilitiesDeposit?: number;
  dueDate?: string;
}
