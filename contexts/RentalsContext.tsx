import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback, useRef } from "react";
import type { Rental } from "@/src/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getUserById } from "@/src/api/users";

export interface RentalNotification {
  rentalId: string;
  propertyAddress: string;
  senderName: string;
  senderPhoto?: string;
  message: string;
  type: 'rental_request' | 'rental_approved' | 'rental_cancelled';
  navigationPath?: string;
}

export const [RentalsProvider, useRentals] = createContextHook(() => {
  const auth = useAuth();
  const user = auth?.user ?? null;
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rentalNotification, setRentalNotification] = useState<RentalNotification | null>(null);
  const previousRentalsRef = useRef<Rental[]>([]);

  useEffect(() => {
    loadRentals(false);
    
    // Poll for rental changes every 3 seconds
    const interval = setInterval(() => {
      loadRentals(true);
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadRentals = useCallback(async (checkForChanges = false) => {
    try {
      setIsLoading(true);
      
      if (!user) {
        setRentals([]);
        previousRentalsRef.current = [];
        return;
      }
      
      const { data, error } = await supabase
        .from('rentals')
        .select('*')
        .or(`tenant_id.eq.${user.id},landlord_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const newRentals = data.map((rental: any) => ({
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
        }));

        // Check for changes and show notifications
        if (checkForChanges && previousRentalsRef.current.length > 0) {
          await checkRentalChanges(previousRentalsRef.current, newRentals);
        }

        setRentals(newRentals);
        previousRentalsRef.current = newRentals;
      }
    } catch (error) {
      console.error("Failed to load rentals:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const checkRentalChanges = async (oldRentals: Rental[], newRentals: Rental[]) => {
    if (!user) return;

    // Check for new pending rentals (for landlords)
    if (user.role === 'landlord') {
      const oldPendingIds = new Set(
        oldRentals
          .filter(r => r.landlordId === user.id && r.status === 'pending')
          .map(r => r.id)
      );
      
      const newPendingRentals = newRentals.filter(
        r => r.landlordId === user.id && 
        r.status === 'pending' && 
        !oldPendingIds.has(r.id)
      );

      if (newPendingRentals.length > 0) {
        const latestRental = newPendingRentals[0];
        try {
          const tenant = await getUserById(latestRental.tenantId);
          setRentalNotification({
            rentalId: latestRental.id,
            propertyAddress: latestRental.propertyAddress,
            senderName: tenant?.fullName || 'Tenant',
            senderPhoto: tenant?.avatarUrl,
            message: `New rental request for ${latestRental.propertyAddress}`,
            type: 'rental_request',
            navigationPath: '/landlord-rentals',
          });
        } catch (error) {
          console.error('Failed to get tenant info:', error);
          setRentalNotification({
            rentalId: latestRental.id,
            propertyAddress: latestRental.propertyAddress,
            senderName: 'Tenant',
            message: `New rental request for ${latestRental.propertyAddress}`,
            type: 'rental_request',
            navigationPath: '/landlord-rentals',
          });
        }
        return; // Only show one notification at a time
      }
    }

    // Check for status changes (for tenants)
    if (user.role === 'tenant') {
      const oldRentalsMap = new Map(oldRentals.map(r => [r.id, r]));
      
      for (const newRental of newRentals) {
        if (newRental.tenantId !== user.id) continue;
        
        const oldRental = oldRentalsMap.get(newRental.id);
        
        // Check if status changed from pending to confirmed
        if (oldRental?.status === 'pending' && newRental.status === 'confirmed') {
          try {
            const landlord = await getUserById(newRental.landlordId);
            setRentalNotification({
              rentalId: newRental.id,
              propertyAddress: newRental.propertyAddress,
              senderName: landlord?.fullName || 'Landlord',
              senderPhoto: landlord?.avatarUrl,
              message: `Your rental request for ${newRental.propertyAddress} has been confirmed!`,
              type: 'rental_approved',
              navigationPath: '/my-rentals',
            });
          } catch (error) {
            console.error('Failed to get landlord info:', error);
            setRentalNotification({
              rentalId: newRental.id,
              propertyAddress: newRental.propertyAddress,
              senderName: 'Landlord',
              message: `Your rental request for ${newRental.propertyAddress} has been confirmed!`,
              type: 'rental_approved',
              navigationPath: '/my-rentals',
            });
          }
          return; // Only show one notification at a time
        }
        
        // Check if status changed from pending to cancelled
        if (oldRental?.status === 'pending' && newRental.status === 'cancelled') {
          try {
            const landlord = await getUserById(newRental.landlordId);
            setRentalNotification({
              rentalId: newRental.id,
              propertyAddress: newRental.propertyAddress,
              senderName: landlord?.fullName || 'Landlord',
              senderPhoto: landlord?.avatarUrl,
              message: `Your rental request for ${newRental.propertyAddress} was cancelled`,
              type: 'rental_cancelled',
              navigationPath: '/my-rentals',
            });
          } catch (error) {
            console.error('Failed to get landlord info:', error);
            setRentalNotification({
              rentalId: newRental.id,
              propertyAddress: newRental.propertyAddress,
              senderName: 'Landlord',
              message: `Your rental request for ${newRental.propertyAddress} was cancelled`,
              type: 'rental_cancelled',
              navigationPath: '/my-rentals',
            });
          }
          return; // Only show one notification at a time
        }
      }
    }
  };

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
      // Get the current rental before updating
      const currentRental = rentals.find(r => r.id === rentalId);
      const oldStatus = currentRental?.status;

      const { error } = await supabase
        .from('rentals')
        .update({ status })
        .eq('id', rentalId);
      
      if (error) throw error;
      
      // Update local state immediately for better UX
      const updatedRentals = rentals.map(rental =>
        rental.id === rentalId
          ? { ...rental, status: status as any }
          : rental
      );
      setRentals(updatedRentals);
      
      // Trigger notification if status changed to confirmed or cancelled (for tenants)
      if (user?.role === 'tenant' && currentRental && oldStatus === 'pending') {
        if (status === 'confirmed') {
          try {
            const landlord = await getUserById(currentRental.landlordId);
            setRentalNotification({
              rentalId: currentRental.id,
              propertyAddress: currentRental.propertyAddress,
              senderName: landlord?.fullName || 'Landlord',
              senderPhoto: landlord?.avatarUrl,
              message: `Your rental request for ${currentRental.propertyAddress} has been confirmed!`,
              type: 'rental_approved',
              navigationPath: '/my-rentals',
            });
          } catch (error) {
            console.error('Failed to get landlord info:', error);
            setRentalNotification({
              rentalId: currentRental.id,
              propertyAddress: currentRental.propertyAddress,
              senderName: 'Landlord',
              message: `Your rental request for ${currentRental.propertyAddress} has been confirmed!`,
              type: 'rental_approved',
              navigationPath: '/my-rentals',
            });
          }
        } else if (status === 'cancelled') {
          try {
            const landlord = await getUserById(currentRental.landlordId);
            setRentalNotification({
              rentalId: currentRental.id,
              propertyAddress: currentRental.propertyAddress,
              senderName: landlord?.fullName || 'Landlord',
              senderPhoto: landlord?.avatarUrl,
              message: `Your rental request for ${currentRental.propertyAddress} was cancelled`,
              type: 'rental_cancelled',
              navigationPath: '/my-rentals',
            });
          } catch (error) {
            console.error('Failed to get landlord info:', error);
            setRentalNotification({
              rentalId: currentRental.id,
              propertyAddress: currentRental.propertyAddress,
              senderName: 'Landlord',
              message: `Your rental request for ${currentRental.propertyAddress} was cancelled`,
              type: 'rental_cancelled',
              navigationPath: '/my-rentals',
            });
          }
        }
      }
      
      // Reload rentals from database to ensure consistency across all views
      await loadRentals(false);
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
      
      // Update local state immediately for better UX
      setRentals(prev => prev.map(rental =>
        rental.id === rentalId
          ? { ...rental, status: "completed" as const, endDate: new Date().toISOString() }
          : rental
      ));
      
      // Reload rentals from database to ensure consistency across all views
      await loadRentals();
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

  const dismissRentalNotification = () => {
    setRentalNotification(null);
  };

  return {
    rentals,
    isLoading,
    createRental,
    updateRentalStatus,
    stopRental,
    getTenantRentals,
    getLandlordRentals,
    loadRentals, // Export loadRentals so components can manually refresh if needed
    rentalNotification,
    dismissRentalNotification,
  };
});
