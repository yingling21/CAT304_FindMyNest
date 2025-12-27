import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback } from "react";
import type { PropertyType, FurnishingLevel } from "@/src/types";
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
  

  latitude?: number;
  longitude?: number;
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

      // Use current user id as landlordId
      const landlordId = user.id;

      // Fetch listings for this landlord
      const { data, error } = await supabase
        .from('property')
        .select('*')
        .eq('landlord_id', landlordId)
        .order('created_At', { ascending: false });

      if (error) throw error;

      if (data) {
        setListings(
          data.map((listing: any) => ({
            id: listing.property_id?.toString() || '',
            landlordId: landlordId.toString(),
            title: listing.title || '',
            description: listing.description || '',
            propertyType: listing.propertyType || 'apartment',
            size: listing.size?.toString() || '0',
            bedrooms: listing.bedrooms?.toString() || '0',
            bathrooms: listing.bathrooms?.toString() || '0',
            price: listing.monthlyRent || 0,
            address: listing.address || '',
            status: listing.rentalStatus ? 'approved' : 'pending',
            views: 0,
            messages: 0,
            createdAt: listing.created_At || new Date().toISOString(),
            formData: {
              ...initialFormData,
              propertyType: listing.propertyType,
              title: listing.title,
              description: listing.description,
              size: listing.size?.toString() || '',
              bedrooms: listing.bedrooms?.toString() || '',
              bathrooms: listing.bathrooms?.toString() || '',
              furnishingLevel: listing.furnishingLevel,
              monthlyRent: listing.monthlyRent?.toString() || '',
              securityDeposit: listing.securityDeposit?.toString() || '',
              utilitiesDeposit: listing.utilitiesDeposit?.toString() || '',
              minimumRentalPeriod: listing.minimumRentalPeriod?.toString() || '',
              moveInDate: listing.moveInDate || '',
              address: listing.address,
            },
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load listings:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadListings();
    }
  }, [user, loadListings]);


const saveListing = async (landlordUserId: string) => {
  try {
    // Use current user ID as landlord ID
    const landlordId = landlordUserId;

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

    // Insert listing
    const { data, error } = await supabase
      .from('property')
      .insert({
        landlord_id: landlordId,
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        size: parseInt(formData.size) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        furnishingLevel: formData.furnishingLevel,
        monthlyRent: parseFloat(formData.monthlyRent) || 0,
        securityDeposit: parseFloat(formData.securityDeposit) || 0,
        utilitiesDeposit: parseFloat(formData.utilitiesDeposit) || 0,
        minimumRentalPeriod: parseInt(formData.minimumRentalPeriod) || 6,
        moveInDate: formData.moveInDate || new Date().toISOString().split('T')[0],
        amenities,
        houseRules,
        address: formData.address,
        rentalStatus: true,
      })
      .select()
      .single();

    if (error) throw error;

    // Insert photos if any
    if (data && formData.photos && formData.photos.length > 0) {
      const photoInserts = formData.photos.map((photo, index) => ({
        property_id: data.property_id,
        photo_URL: photo,
        is_cover: index === 0,
      }));

      const { error: photoError } = await supabase
        .from('property_Photo')
        .insert(photoInserts);

      if (photoError) console.error('Failed to insert photos:', photoError);
    }

    // Update local state
    if (data) {
      const newListing: StoredListing = {
        id: data.property_id?.toString() || '',
        landlordId: landlordId.toString(),
        title: data.title || '',
        description: data.description || '',
        propertyType: data.propertyType,
        size: data.size?.toString() || '0',
        bedrooms: data.bedrooms?.toString() || '0',
        bathrooms: data.bathrooms?.toString() || '0',
        price: data.monthlyRent || 0,
        address: data.address,
        status: data.rentalStatus ? 'approved' : 'pending',
        views: 0,
        messages: 0,
        createdAt: data.created_At || new Date().toISOString(),
        formData: formData,
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
      const rentalStatus = status === 'approved';
      const { error } = await supabase
        .from('listing')
        .update({ rentalStatus })
        .eq('property_id', listingId);
      
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
