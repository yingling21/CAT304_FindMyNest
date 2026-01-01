import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback } from "react";
import type { PropertyType, FurnishingLevel } from "@/src/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export type ListingFormData = {
  propertyId: string;
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
  roomType: string; // for "room" propertyType
  cooking: string; // "allowed" | "light_cooking" | "no_cooking"
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
  propertyId: "",
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
  roomType: "",
  cooking: "",
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
    setFormData(prev => ({ ...prev, ...data }));
  };

  const resetFormData = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
  };

  const goToNextStep = () => setCurrentStep(prev => Math.min(prev + 1, 9));
  const goToPreviousStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const goToStep = (step: number) => setCurrentStep(Math.max(1, Math.min(step, 9)));

  const loadListings = useCallback(async () => {
    try {
      if (!user) return;
      
      // Only load listings if user is a landlord
      if (user.role !== "landlord") {
        // Tenant users don't have listings to load
        setListings([]);
        return;
      }
      
      // Use user.id directly as landlord_id (no separate landlord table needed)
      const { data, error } = await supabase
        .from("property")
        .select("*")
        .eq("landlord_id", user.id)
        .order("created_At", { ascending: false });

      if (error) throw error;

      if (data) {
        setListings(
          data.map((listing: any) => ({
            id: listing.property_id?.toString() || "",
            landlordId: user.id,
            title: listing.title || "",
            description: listing.description || "",
            propertyType: listing.propertyType || "apartment",
            size: listing.size?.toString() || "0",
            bedrooms: listing.bedrooms?.toString() || "0",
            bathrooms: listing.bathrooms?.toString() || "0",
            price: listing.monthlyRent || 0,
            address: listing.address || "",
            status: listing.rentalStatus ? "approved" : "pending",
            views: 0,
            messages: 0,
            createdAt: listing.created_At || new Date().toISOString(),
            formData: {
              ...initialFormData,
              propertyType: listing.propertyType,
              title: listing.title,
              description: listing.description,
              size: listing.size?.toString() || "",
              bedrooms: listing.bedrooms?.toString() || "",
              bathrooms: listing.bathrooms?.toString() || "",
              furnishingLevel: listing.furnishingLevel,
              monthlyRent: listing.monthlyRent?.toString() || "",
              securityDeposit: listing.securityDeposit?.toString() || "",
              utilitiesDeposit: listing.utilitiesDeposit?.toString() || "",
              minimumRentalPeriod: listing.minimumRentalPeriod?.toString() || "",
              moveInDate: listing.moveInDate || "",
              address: listing.address,
              latitude: listing.latitude,
              longitude: listing.longitude,
            },
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load listings:", err);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadListings();
  }, [user, loadListings]);

  const saveListing = async (landlordId: string) => {
    try {
      if (!user || user.role !== "landlord") {
        throw new Error('Only landlords can create listings');
      }

      // Use user.id directly as landlord_id (no separate landlord table needed)
      const landlordIdToUse = user.id;

      const amenities = {
        // In-room amenities (only for room/studio)
        ...(formData.propertyType === "room" || formData.propertyType === "studio" 
          ? { bedType: formData.bedType || null } 
          : {}),
        deskAndChair: formData.deskAndChair,
        wardrobe: formData.wardrobe,
        airConditioning: formData.airConditioning,
        waterHeater: formData.waterHeater,
        
        // Shared facilities
        wifi: formData.wifi,
        kitchenAccess: formData.kitchenAccess,
        washingMachine: formData.washingMachine,
        refrigerator: formData.refrigerator,
        parking: formData.parking,
        security: formData.security,
        balcony: formData.balcony,
        
        // Utilities (moved from Case 4)
        utilitiesIncluded: formData.utilitiesIncluded,
        estimatedMonthlyUtilities: formData.estimatedMonthlyUtilities 
          ? parseFloat(formData.estimatedMonthlyUtilities) 
          : null,
        internetSpeed: formData.internetSpeed || null,
      };
  
      const houseRules = {
        cooking: formData.cooking || "allowed", // ADD THIS
        guestsAllowed: formData.guestsAllowed,
        smokingAllowed: formData.smokingAllowed,
        petsAllowed: formData.petsAllowed,
        quietHours: formData.quietHours || null,
        cleaningRules: formData.cleaningRules || null,
      };
  
      const { data, error } = await supabase
        .from('property')
        .insert({
          landlord_id: landlordIdToUse,
          title: formData.title,
          description: formData.description,
          propertyType: formData.propertyType,
          roomType: formData.propertyType === "room" ? formData.roomType : null,
          size: parseInt(formData.size) || 0,
          bedrooms: parseInt(formData.bedrooms) || 0,
          bathrooms: parseInt(formData.bathrooms) || 0,
          floorLevel: (formData.propertyType === "apartment" || 
                        formData.propertyType === "studio" || 
                        formData.propertyType === "room") 
            ? parseInt(formData.floorLevel) || null 
            : null, 
          furnishingLevel: formData.furnishingLevel,
          monthlyRent: parseFloat(formData.monthlyRent) || 0,
          securityDeposit: parseFloat(formData.securityDeposit) || 0,
          utilitiesDeposit: parseFloat(formData.utilitiesDeposit) || 0,
          minimumRentalPeriod: parseInt(formData.minimumRentalPeriod) || 6,
          moveInDate: formData.moveInDate || new Date().toISOString().split("T")[0],
          amenities,
          houseRules,
          address: formData.address,
          latitude: formData.latitude ?? null,
          longitude: formData.longitude ?? null,
          rentalStatus: false,
        })
        .select()
        .single();

      if (error) throw error;

      if (data && formData.photos?.length > 0) {
        const photoInserts = formData.photos.map((photo, index) => ({
          property_id: data.property_id,
          photo_url: photo,
          is_cover: index === 0,
        }));
        const { error: photoError } = await supabase.from("property_Photo").insert(photoInserts);
        if (photoError) console.error("Failed to insert photos:", photoError);
      }

      if (data) {
        const newListing: StoredListing = {
          id: data.property_id?.toString() || '',
          landlordId: landlordIdToUse,
          title: data.title || '',
          description: data.description || '',
          propertyType: data.propertyType,
          size: data.size?.toString() || "0",
          bedrooms: data.bedrooms?.toString() || "0",
          bathrooms: data.bathrooms?.toString() || "0",
          price: data.monthlyRent || 0,
          address: data.address,
          status: data.rentalStatus ? "approved" : "pending",
          views: 0,
          messages: 0,
          createdAt: data.created_At || new Date().toISOString(),
          formData: formData,
        };
        setListings(prev => [newListing, ...prev]);
      }
    } catch (err) {
      console.error("Failed to save listing:", err);
      throw err;
    }
  };

  const getListingsByLandlord = (_landlordId: string) => listings;

  const updateListingStatus = async (listingId: string, status: "approved" | "pending" | "rejected") => {
    try {
      const rentalStatus = status === "approved";
      const { error } = await supabase
        .from('property')
        .update({ rentalStatus })
        .eq("property_id", listingId);
      if (error) throw error;

      setListings(prev =>
        prev.map(listing => (listing.id === listingId ? { ...listing, status } : listing))
      );
    } catch (err) {
      console.error("Failed to update listing status:", err);
      throw err;
    }
  };

  const deleteListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from("property")
        .delete()
        .eq("property_id", listingId);
      
      if (error) throw error;
  
      // Remove from local state
      setListings(prev => prev.filter(listing => listing.id !== listingId));
    } catch (err) {
      console.error("Failed to delete listing:", err);
      throw err;
    }
  };

  const updateListing = async (listingId: string, landlordId: string) => {
    try {
      const amenities = {
        ...(formData.propertyType === "room" || formData.propertyType === "studio" 
          ? { bedType: formData.bedType || null } 
          : {}),
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
        utilitiesIncluded: formData.utilitiesIncluded,
        estimatedMonthlyUtilities: formData.estimatedMonthlyUtilities 
          ? parseFloat(formData.estimatedMonthlyUtilities) 
          : null,
        internetSpeed: formData.internetSpeed || null,
      };
  
      const houseRules = {
        cooking: formData.cooking || "allowed",
        guestsAllowed: formData.guestsAllowed,
        smokingAllowed: formData.smokingAllowed,
        petsAllowed: formData.petsAllowed,
        quietHours: formData.quietHours || null,
        cleaningRules: formData.cleaningRules || null,
      };
  
      // Build update object conditionally
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        roomType: formData.propertyType === "room" ? formData.roomType : null,
        size: parseInt(formData.size) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        furnishingLevel: formData.furnishingLevel,
        monthlyRent: parseFloat(formData.monthlyRent) || 0,
        securityDeposit: parseFloat(formData.securityDeposit) || 0,
        utilitiesDeposit: parseFloat(formData.utilitiesDeposit) || 0,
        minimumRentalPeriod: parseInt(formData.minimumRentalPeriod) || 6,
        moveInDate: formData.moveInDate || new Date().toISOString().split("T")[0],
        amenities,
        houseRules,
        address: formData.address,
        latitude: formData.latitude ?? null,
        longitude: formData.longitude ?? null,
        // Keep existing rentalStatus - don't change it on update
      };
  
      // Only include floor_level if the column exists and value is provided
      // Check if formData has floorLevel and it's not empty
      if (formData.floorLevel && formData.floorLevel.trim() !== "") {
        const floorLevelValue = parseInt(formData.floorLevel);
        if (!isNaN(floorLevelValue)) {
          updateData.floorLevel = floorLevelValue;
        }
      }
  
      const { data, error } = await supabase
        .from("property")
        .update(updateData)
        .eq("property_id", listingId)
        .select()
        .single();
  
      if (error) throw error;
  
      // Update photos if changed
      if (formData.photos?.length > 0) {
        // Delete old photos
        await supabase
          .from("property_Photo")
          .delete()
          .eq("property_id", listingId);
  
        // Insert new photos
        const photoInserts = formData.photos.map((photo, index) => ({
          property_id: listingId,
          photo_url: photo,
          is_cover: index === 0,
        }));
        const { error: photoError } = await supabase.from("property_Photo").insert(photoInserts);
        if (photoError) console.error("Failed to update photos:", photoError);
      }
  
      // Reload listings
      await loadListings();
    } catch (err) {
      console.error("Failed to update listing:", err);
      throw err;
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
    deleteListing,
    updateListing,
  };
});
