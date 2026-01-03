import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback } from "react";
import type { Rental } from "@/src/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export const [RentalsProvider, useRentals] = createContextHook(() => {
  const auth = useAuth();
  const user = auth?.user ?? null;
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadRentals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadRentals = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        setRentals([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('rentals')
        .select('*')
        .or(`tenant_id.eq.${user.id},landlord_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setRentals(data.map((rental: any) => ({
          id: rental.id,
          propertyId: rental.property_id,
          propertyAddress: rental.property_address,
          propertyImage: rental.property_image,
          tenantId: rental.tenant_id,
          landlordId: rental.landlord_id,
          monthlyRent: rental.monthly_rent,
          securityDeposit: rental.security_deposit,
          startDate: rental.start_date,
          endDate: rental.end_date,
          status: rental.status,
          hasReview: rental.has_review,
          createdAt: rental.created_at,
        })));
      }
    } catch (error) {
      console.error("Failed to load rentals:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createRental = async (
    propertyId: string,
    propertyAddress: string,
    propertyImage: string,
    landlordId: string,
    monthlyRent: number,
    securityDeposit: number,
    startDate: string,
    durationMonths: number
  ): Promise<Rental> => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        throw new Error("User not authenticated");
      }

      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);

      // Calculate new available date (one day after rental ends)
      const newAvailableDate = new Date(endDate);
      newAvailableDate.setDate(newAvailableDate.getDate() + 1);

      console.log('Creating rental with tenant_id:', authUser.id);
      console.log('Rental data:', {
        property_id: propertyId,
        tenant_id: authUser.id,
        landlord_id: landlordId,
      });

      // Create rental with pending status
      const { data, error } = await supabase
        .from('rentals')
        .insert({
          property_id: propertyId,
          property_address: propertyAddress,
          property_image: propertyImage,
          tenant_id: authUser.id,
          landlord_id: landlordId,
          monthly_rent: monthlyRent,
          security_deposit: securityDeposit,
          start_date: startDate,
          end_date: endDate.toISOString(),
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) {
        console.error('Failed to create rental:', error);
        throw error;
      }
      
      // Update property's availableDate to be after the rental end date
      const { error: updateError } = await supabase
        .from('property')
        .update({
          availableDate: newAvailableDate.toISOString(),
        })
        .eq('property_id', propertyId);
      
      if (updateError) {
        console.error('Failed to update property availableDate:', updateError);
        // Don't throw error here, rental is already created
      }
      
      const newRental: Rental = {
        id: data.id,
        propertyId: data.property_id,
        propertyAddress: data.property_address,
        propertyImage: data.property_image,
        tenantId: data.tenant_id,
        landlordId: data.landlord_id,
        monthlyRent: data.monthly_rent,
        securityDeposit: data.security_deposit,
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status,
        createdAt: data.created_at,
      };

      setRentals(prev => [newRental, ...prev]);
      return newRental;
    } catch (error) {
      console.error("Failed to create rental:", error);
      throw error;
    }
  };

  const updateRentalStatus = async (
    rentalId: string,
    status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from('rentals')
        .update({ status })
        .eq('id', rentalId);
      
      if (error) throw error;
      
      setRentals(prev => prev.map(rental =>
        rental.id === rentalId
          ? { ...rental, status: status as any }
          : rental
      ));
    } catch (error) {
      console.error("Failed to update rental status:", error);
      throw error;
    }
  };

  const stopRental = async (rentalId: string) => {
    try {
      const { error } = await supabase
        .from('rentals')
        .update({
          status: 'completed',
          end_date: new Date().toISOString(),
        })
        .eq('id', rentalId);
      
      if (error) throw error;
      
      setRentals(prev => prev.map(rental =>
        rental.id === rentalId
          ? { ...rental, status: "completed" as const, endDate: new Date().toISOString() }
          : rental
      ));
    } catch (error) {
      console.error("Failed to stop rental:", error);
      throw error;
    }
  };

  const getTenantRentals = () => {
    if (!user) return [];
    return rentals.filter(rental => rental.tenantId === user.id);
  };

  const getLandlordRentals = () => {
    if (!user) return [];
    return rentals.filter(rental => rental.landlordId === user.id);
  };

  return {
    rentals,
    isLoading,
    createRental,
    updateRentalStatus,
    stopRental,
    getTenantRentals,
    getLandlordRentals,
  };
});
