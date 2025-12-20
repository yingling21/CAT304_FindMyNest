import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback } from "react";
import type { PropertyType, FurnishingLevel } from "@/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export type ListingFormData = {
  propertyType: PropertyType | "";
  size: string;
  bedrooms: string;
  bathrooms: string;
  floorLevel: string;
  furnishingLevel: FurnishingLevel | "";
  
  monthlyRent: string;
  securityDeposit: string;
  utilitiesDeposit: string;
  minimumRentalPeriod: string;
  moveInDate: string;
  
  bedType: string;
  deskAndChair: boolean;
  wardrobe: boolean;
  airConditioning: boolean;
  waterHeater: boolean;
  wifi: boolean;
  kitchenAccess: boolean;
  washingMachine: boolean;
  refrigerator: boolean;
  parking: boolean;
  security: boolean;
  balcony: boolean;
  
  utilitiesIncluded: boolean;
  estimatedMonthlyUtilities: string;
  internetSpeed: string;
  
  guestsAllowed: boolean;
  smokingAllowed: boolean;
  petsAllowed: boolean;
  quietHours: string;
  cleaningRules: string;
  
  address: string;
  nearbyLandmarks: string;
  distanceToTransport: string;
  
  photos: string[];
  
  title: string;
  description: string;
};

const initialFormData: ListingFormData = {
  propertyType: "",
  size: "",
  bedrooms: "",
  bathrooms: "",
  floorLevel: "",
  furnishingLevel: "",
  
  monthlyRent: "",
  securityDeposit: "",
  utilitiesDeposit: "",
  minimumRentalPeriod: "",
  moveInDate: "",
  
  bedType: "",
  deskAndChair: false,
  wardrobe: false,
  airConditioning: false,
  waterHeater: false,
  wifi: false,
  kitchenAccess: false,
  washingMachine: false,
  refrigerator: false,
  parking: false,
  security: false,
  balcony: false,
  
  utilitiesIncluded: false,
  estimatedMonthlyUtilities: "",
  internetSpeed: "",
  
  guestsAllowed: false,
  smokingAllowed: false,
  petsAllowed: false,
  quietHours: "",
  cleaningRules: "",
  
  address: "",
  nearbyLandmarks: "",
  distanceToTransport: "",
  
  photos: [],
  
  title: "",
  description: "",
};

export type StoredListing = {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  propertyType: PropertyType | "";
  size: string;
  bedrooms: string;
  bathrooms: string;
  price: number;
  address: string;
  status: "approved" | "pending" | "rejected";
  views: number;
  messages: number;
  createdAt: string;
  formData: ListingFormData;
};

export const [ListingProvider, useListing] = createContextHook(() => {
  const auth = useAuth();
  const user = auth?.user ?? null;
  const [formData, setFormData] = useState<ListingFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [listings, setListings] = useState<StoredListing[]>([]);

  const updateFormData = (data: Partial<ListingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetFormData = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
  };

  const goToNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 9));
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    setCurrentStep(Math.max(1, Math.min(step, 9)));
  };

  const loadListings = useCallback(async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setListings(data.map((listing: any) => ({
          id: listing.id,
          landlordId: listing.landlord_id,
          title: listing.title,
          description: listing.description,
          propertyType: listing.property_type,
          size: listing.size,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          price: listing.monthly_rent,
          address: listing.address,
          status: listing.status,
          views: listing.views,
          messages: listing.messages,
          createdAt: listing.created_at,
          formData: listing.form_data,
        })));
      }
    } catch (error) {
      console.error("Failed to load listings:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadListings();
    }
  }, [user, loadListings]);

  const saveListing = async (landlordId: string) => {
    try {
      const amenities = {
        bedType: formData.bedType,
        deskAndChair: formData.deskAndChair,
        wardrobe: formData.wardrobe,
        airConditioning: formData.airConditioning,
        waterHeater: formData.waterHeater,
        wifi: formData.wifi,
        kitchenAccess: formData.kitchenAccess,
        washingMachine: formData.washingMachine,
        refrigerator: formData.refrigerator,
        parking: formData.parking,
        security: formData.security,
        balcony: formData.balcony,
      };

      const houseRules = {
        guestsAllowed: formData.guestsAllowed,
        smokingAllowed: formData.smokingAllowed,
        petsAllowed: formData.petsAllowed,
        quietHours: formData.quietHours,
        cleaningRules: formData.cleaningRules,
      };

      const { data, error } = await supabase
        .from('listings')
        .insert({
          landlord_id: landlordId,
          title: formData.title,
          description: formData.description,
          property_type: formData.propertyType,
          size: formData.size,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          floor_level: formData.floorLevel,
          furnishing_level: formData.furnishingLevel,
          monthly_rent: parseFloat(formData.monthlyRent) || 0,
          security_deposit: parseFloat(formData.securityDeposit) || 0,
          utilities_deposit: parseFloat(formData.utilitiesDeposit) || 0,
          minimum_rental_period: formData.minimumRentalPeriod,
          move_in_date: formData.moveInDate,
          amenities,
          utilities_included: formData.utilitiesIncluded,
          estimated_monthly_utilities: formData.estimatedMonthlyUtilities,
          internet_speed: formData.internetSpeed,
          house_rules: houseRules,
          address: formData.address,
          nearby_landmarks: formData.nearbyLandmarks,
          distance_to_transport: formData.distanceToTransport,
          photos: formData.photos,
          status: 'pending',
          form_data: formData,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newListing: StoredListing = {
          id: data.id,
          landlordId: data.landlord_id,
          title: data.title,
          description: data.description,
          propertyType: data.property_type,
          size: data.size,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          price: data.monthly_rent,
          address: data.address,
          status: data.status,
          views: data.views,
          messages: data.messages,
          createdAt: data.created_at,
          formData: data.form_data,
        };
        setListings(prev => [newListing, ...prev]);
        console.log("Listing saved:", newListing.id);
      }
    } catch (error) {
      console.error("Failed to save listing:", error);
      throw error;
    }
  };

  const getListingsByLandlord = (landlordId: string) => {
    return listings;
  };

  const updateListingStatus = async (
    listingId: string,
    status: "approved" | "pending" | "rejected"
  ) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status })
        .eq('id', listingId);
      
      if (error) throw error;
      
      setListings(prev => prev.map((listing) =>
        listing.id === listingId ? { ...listing, status } : listing
      ));
    } catch (error) {
      console.error("Failed to update listing status:", error);
      throw error;
    }
  };

  return {
    formData,
    currentStep,
    updateFormData,
    resetFormData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    listings,
    saveListing,
    getListingsByLandlord,
    updateListingStatus,
  };
});
