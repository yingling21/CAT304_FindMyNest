import { supabase } from '@/lib/supabase';
import type { Rental } from '@/src/types/rental';
import { normalizeRental, normalizeRentals } from '@/src/utils/normalizeRental';

export async function getRentalsByTenant(tenantId: string): Promise<Rental[]> {
  const { data, error } = await supabase
    .from('rentals')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch rentals:', error);
    throw error;
  }

  return normalizeRentals(data || []);
}

export async function getRentalsByLandlord(landlordId: string): Promise<Rental[]> {
  const { data, error } = await supabase
    .from('rentals')
    .select('*')
    .eq('landlord_id', landlordId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch rentals:', error);
    throw error;
  }

  return normalizeRentals(data || []);
}

export async function getRentalById(id: string): Promise<Rental | null> {
  const { data, error } = await supabase
    .from('rentals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to fetch rental:', error);
    throw error;
  }

  return data ? normalizeRental(data) : null;
}

export async function createRental(rentalData: Partial<Rental>): Promise<Rental> {
  const { data, error } = await supabase
    .from('rentals')
    .insert({
      property_id: rentalData.propertyId,
      tenant_id: rentalData.tenantId,
      landlord_id: rentalData.landlordId,
      monthly_rent: rentalData.monthlyRent,
      security_deposit: rentalData.securityDeposit,
      start_date: rentalData.startDate,
      end_date: rentalData.endDate,
      status: rentalData.status || 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create rental:', error);
    throw error;
  }

  return normalizeRental(data);
}

export async function updateRentalStatus(id: string, status: 'active' | 'completed' | 'cancelled'): Promise<void> {
  const { error } = await supabase
    .from('rentals')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Failed to update rental status:', error);
    throw error;
  }
}
