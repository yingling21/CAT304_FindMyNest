import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback } from "react";
import type { Rental } from "@/types";
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
          propertyTitle: rental.property_title,
          propertyImage: rental.property_image,
          propertyAddress: rental.property_address,
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
    propertyTitle: string,
    propertyImage: string,
    propertyAddress: string,
    landlordId: string,
    monthlyRent: number,
    securityDeposit: number,
    startDate: string,
    durationMonths: number
  ): Promise<Rental> => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);

      const { data, error } = await supabase
        .from('rentals')
        .insert({
          property_id: propertyId,
          property_title: propertyTitle,
          property_image: propertyImage,
          property_address: propertyAddress,
          tenant_id: user.id,
          landlord_id: landlordId,
          monthly_rent: monthlyRent,
          security_deposit: securityDeposit,
          start_date: startDate,
          end_date: endDate.toISOString(),
          status: 'active',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newRental: Rental = {
        id: data.id,
        propertyId: data.property_id,
        propertyTitle: data.property_title,
        propertyImage: data.property_image,
        propertyAddress: data.property_address,
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
    stopRental,
    getTenantRentals,
    getLandlordRentals,
  };
});
