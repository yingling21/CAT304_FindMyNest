import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PropertyType, RoomType, FurnishingLevel, CookingPolicy } from "@/types";

export type ListingFormData = {
  propertyType: PropertyType | "";
  roomType: RoomType | "";
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
  
  cooking: CookingPolicy | "";
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
  roomType: "",
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
  
  cooking: "",
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
  roomType: RoomType | "";
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

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const stored = await AsyncStorage.getItem("listings");
      if (stored) {
        setListings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load listings:", error);
    }
  };

  const saveListing = async (landlordId: string) => {
    try {
      const newListing: StoredListing = {
        id: Date.now().toString(),
        landlordId,
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        roomType: formData.roomType,
        size: formData.size,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        price: parseFloat(formData.monthlyRent) || 0,
        address: formData.address,
        status: "pending",
        views: 0,
        messages: 0,
        createdAt: new Date().toISOString(),
        formData,
      };

      const updatedListings = [...listings, newListing];
      await AsyncStorage.setItem("listings", JSON.stringify(updatedListings));
      setListings(updatedListings);
      console.log("Listing saved:", newListing.id);
    } catch (error) {
      console.error("Failed to save listing:", error);
      throw error;
    }
  };

  const getListingsByLandlord = (landlordId: string) => {
    return listings.filter((listing) => listing.landlordId === landlordId);
  };

  const updateListingStatus = async (
    listingId: string,
    status: "approved" | "pending" | "rejected"
  ) => {
    try {
      const updatedListings = listings.map((listing) =>
        listing.id === listingId ? { ...listing, status } : listing
      );
      await AsyncStorage.setItem("listings", JSON.stringify(updatedListings));
      setListings(updatedListings);
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
