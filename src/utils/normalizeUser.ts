import type { User, UserRole, VerificationStatus } from '@/src/types/user';

export function normalizeUser(row: any): User {
  return {
    id: row.id || '',
    email: row.email || '',
    fullName: row.full_name || '',
    phoneNumber: row.phone_number || '',
    role: (row.role || 'tenant') as UserRole,
    avatarUrl: row.avatar_url || undefined,
    verificationStatus: (row.verification_status || 'pending') as VerificationStatus,
    identityDocument: row.identity_document || undefined,
    ownershipDocument: row.ownership_document || undefined,
    createdAt: row.updated_at || new Date().toISOString(),
  };
}
