import { supabase } from '@/lib/supabase';
import type { User, UserRole, VerificationStatus } from '@/src/types/user';
import { normalizeUser } from '@/src/utils/normalizeUser';

export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }

  return data ? normalizeUser(data) : null;
}

export async function createUser(params: {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role?: UserRole;
}): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: params.id,
      email: params.email,
      full_name: params.fullName,
      phone_number: params.phoneNumber,
      role: params.role || 'tenant',
      verification_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create user:', error);
    throw error;
  }

  return normalizeUser(data);
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update user role:', error);
    throw error;
  }
}

export async function updateUserVerification(
  userId: string,
  params: {
    identityDocument?: string;
    ownershipDocument?: string;
    verificationStatus?: VerificationStatus;
  }
): Promise<void> {
  const updates: Record<string, any> = {};

  if (params.identityDocument !== undefined) {
    updates.identity_document = params.identityDocument;
  }
  if (params.ownershipDocument !== undefined) {
    updates.ownership_document = params.ownershipDocument;
  }
  if (params.verificationStatus !== undefined) {
    updates.verification_status = params.verificationStatus;
  }

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Failed to update user verification:', error);
    throw error;
  }
}

export async function updateUserProfile(
  userId: string,
  params: {
    fullName?: string;
    phoneNumber?: string;
    avatarUrl?: string;
  }
): Promise<void> {
  const updates: Record<string, any> = {};

  if (params.fullName !== undefined) {
    updates.full_name = params.fullName;
  }
  if (params.phoneNumber !== undefined) {
    updates.phone_number = params.phoneNumber;
  }
  if (params.avatarUrl !== undefined) {
    updates.avatar_url = params.avatarUrl;
  }

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Failed to update user profile:', error);
    throw error;
  }
}
