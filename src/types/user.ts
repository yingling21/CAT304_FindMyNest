export type UserRole = "tenant" | "landlord";

export type VerificationStatus = "pending" | "approved" | "rejected";

export interface User {
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
}
