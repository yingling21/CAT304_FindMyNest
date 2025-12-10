import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback } from "react";
import type { Rental } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

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
      const stored = await AsyncStorage.getItem("rentals");
      const allRentals: Rental[] = stored ? JSON.parse(stored) : [];
      
      if (user) {
        const userRentals = allRentals.filter(
          rental => rental.tenantId === user.id || rental.landlordId === user.id
        );
        setRentals(userRentals);
      } else {
        setRentals([]);
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

      const newRental: Rental = {
        id: Date.now().toString(),
        propertyId,
        propertyTitle,
        propertyImage,
        propertyAddress,
        tenantId: user.id,
        landlordId,
        monthlyRent,
        securityDeposit,
        startDate,
        endDate: endDate.toISOString(),
        status: "active",
        createdAt: new Date().toISOString(),
      };

      const stored = await AsyncStorage.getItem("rentals");
      const allRentals: Rental[] = stored ? JSON.parse(stored) : [];
      allRentals.push(newRental);
      await AsyncStorage.setItem("rentals", JSON.stringify(allRentals));

      setRentals(prev => [...prev, newRental]);
      return newRental;
    } catch (error) {
      console.error("Failed to create rental:", error);
      throw error;
    }
  };

  const stopRental = async (rentalId: string) => {
    try {
      const stored = await AsyncStorage.getItem("rentals");
      const allRentals: Rental[] = stored ? JSON.parse(stored) : [];
      
      const updatedRentals = allRentals.map(rental =>
        rental.id === rentalId
          ? { ...rental, status: "completed" as const, endDate: new Date().toISOString() }
          : rental
      );
      
      await AsyncStorage.setItem("rentals", JSON.stringify(updatedRentals));
      
      if (user) {
        const userRentals = updatedRentals.filter(
          rental => rental.tenantId === user.id || rental.landlordId === user.id
        );
        setRentals(userRentals);
      }
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
