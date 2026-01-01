import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Platform,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, ChevronRight, Check } from "lucide-react-native";
import { useListing } from "@/contexts/ListingContext";
import type { PropertyType, FurnishingLevel } from "@/src/types";
import { styles } from "@/styles/listing";
import DateTimePicker from '@react-native-community/datetimepicker';
import MapPicker from "@/components/maps/MapPicker";
import { pickImages } from '@/src/utils/imagePicker';
import { uploadPropertyPhoto } from '@/src/service/photoService';
import { Keyboard } from 'react-native';
import * as Location from "expo-location";
import { useAuth } from "@/contexts/AuthContext";

const TOTAL_STEPS = 9;

const STEP_TITLES = [
  "Basic Details",
  "Pricing & Availability",
  "Amenities & Facilities",
  "Utilities & Bills",
  "House Rules",
  "Location",
  "Photos & Media",
  "Review",
  "Submit",
];

export default function EditListingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { formData, updateFormData, resetFormData, updateListing } = useListing();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const loadPropertyData = async () => {
      if (!id || isDataLoaded) return; // Prevent reloading
      
      try {
        const { getPropertyById } = await import('@/src/api/properties');
        const property = await getPropertyById(id);
        
        if (property) {
          // Populate form with existing property data
          updateFormData({
            propertyId: property.id,
            propertyType: property.propertyType,
            roomType: property.roomType || "",
            size: property.size.toString(),
            bedrooms: property.bedrooms.toString(),
            bathrooms: property.bathrooms.toString(),
            floorLevel: property.floorLevel?.toString() || "",
            furnishingLevel: property.furnishingLevel,
            monthlyRent: property.monthlyRent.toString(),
            securityDeposit: property.securityDeposit.toString(),
            utilitiesDeposit: property.utilitiesDeposit.toString(),
            minimumRentalPeriod: property.minimumRentalPeriod.toString(),
            availableDate: property.availableDate,
            bedType: property.amenities?.bedType || "",
            deskAndChair: property.amenities?.deskAndChair || false,
            wardrobe: property.amenities?.wardrobe || false,
            airConditioning: property.amenities?.airConditioning || false,
            waterHeater: property.amenities?.waterHeater || false,
            wifi: property.amenities?.wifi || false,
            kitchenAccess: property.amenities?.kitchenAccess || false,
            washingMachine: property.amenities?.washingMachine || false,
            refrigerator: property.amenities?.refrigerator || false,
            parking: property.amenities?.parking || false,
            security: property.amenities?.security || false,
            balcony: property.amenities?.balcony || false,
            utilitiesIncluded: property.amenities?.utilitiesIncluded || false,
            estimatedMonthlyUtilities: property.amenities?.estimatedMonthlyUtilities?.toString() || "",
            internetSpeed: property.amenities?.internetSpeed || "",
            cooking: property.houseRules?.cooking || "allowed",
            guestsAllowed: property.houseRules?.guestsAllowed || false,
            smokingAllowed: property.houseRules?.smokingAllowed || false,
            petsAllowed: property.houseRules?.petsAllowed || false,
            quietHours: property.houseRules?.quietHours || "",
            cleaningRules: property.houseRules?.cleaningRules || "",
            latitude: property.latitude,
            longitude: property.longitude,
            address: property.address,
            photos: property.photos.map(p => p.url),
            title: property.title,
            description: property.description,
          });
          
          // Update available date state
          if (property.availableDate) {
            setAvailableDate(new Date(property.availableDate));
          }
          
          setIsDataLoaded(true); // Mark as loaded
        }
      } catch (error) {
        console.error("Failed to load property:", error);
        Alert.alert("Error", "Failed to load property data");
      }
    };
    
    loadPropertyData();
  }, [id]); 

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const [availableDate, setAvailableDate] = React.useState<Date>(
    formData.availableDate ? new Date(formData.availableDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setAvailableDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      updateFormData({ availableDate: formattedDate });
    }
  };

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      if (!user) {
        console.error("No user found");
        Alert.alert("Error", "You must be logged in to update a listing");
        return;
      }
      
      if (!id) {
        console.error("No listing ID found");
        Alert.alert("Error", "Listing ID is missing");
        return;
      }
      
      try {
        setIsSubmitting(true);
        await updateListing(id, user.id);
        resetFormData();
        Alert.alert("Success", "Listing updated successfully!");
        router.back();
      } catch (error) {
        console.error("Failed to update listing:", error);
        Alert.alert("Error", "Failed to update listing. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | undefined>({
    latitude: formData.latitude || 3.1390,
    longitude: formData.longitude || 101.6869,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [selectedImages, setSelectedImages] = useState<any[]>([]);

  async function handleAddPhoto() {
    try {
      Keyboard.dismiss();
      await new Promise(r => setTimeout(r, 300));
      const images = await pickImages();
      if (!images.length) return;
      const uploadedUrls: string[] = [];
      for (const img of images) {
        try {
          const url = await uploadPropertyPhoto(img);
          uploadedUrls.push(url);
        } catch (err) {
          console.warn('Failed to upload image:', img.uri, err);
        }
      }
      updateFormData({
        photos: [...(formData.photos || []), ...uploadedUrls],
      });
    } catch (err) {
      console.error('Failed to pick or upload image:', err);
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Property Details</Text>
            
            <Text style={styles.label}>
              Property Type <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={styles.optionsRow}>
              {(["house", "apartment", "studio", "room"] as PropertyType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionChip,
                    formData.propertyType === type && styles.optionChipSelected,
                  ]}
                  onPress={() => {
                    updateFormData({ propertyType: type });
                    // Reset roomType when switching away from "room"
                    if (type !== "room") {
                      updateFormData({ roomType: "" });
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      formData.propertyType === type && styles.optionChipTextSelected,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
      
            {/* Show roomType only for "room" propertyType */}
            {formData.propertyType === "room" && (
              <>
                <Text style={styles.label}>
                  Room Type <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.optionsRow}>
                  {[
                    { value: "master_room", label: "Master Room" },
                    { value: "single_room", label: "Single Room" },
                    { value: "shared_room", label: "Shared Room" },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionChip,
                        formData.roomType === option.value && styles.optionChipSelected,
                      ]}
                      onPress={() => updateFormData({ roomType: option.value })}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          formData.roomType === option.value && styles.optionChipTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
      
            <Text style={styles.label}>Size (sq ft) <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Enter size"
              keyboardType="numeric"
              value={formData.size}
              onChangeText={(text) => updateFormData({ size: text })}
            />
      
            <Text style={styles.label}>Bedrooms</Text>
            <View style={styles.optionsRow}>
              {["0", "1", "2", "3", "4", "5+"].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.optionChip,
                    formData.bedrooms === num && styles.optionChipSelected,
                  ]}
                  onPress={() => updateFormData({ bedrooms: num })}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      formData.bedrooms === num && styles.optionChipTextSelected,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
      
            <Text style={styles.label}>Bathrooms</Text>
            <View style={styles.optionsRow}>
              {["1", "2", "3", "4", "5+"].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.optionChip,
                    formData.bathrooms === num && styles.optionChipSelected,
                  ]}
                  onPress={() => updateFormData({ bathrooms: num })}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      formData.bathrooms === num && styles.optionChipTextSelected,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
      
            {/* Floor Level - available for all property types */}
            <Text style={styles.label}>Floor Level</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Ground floor, 5th floor, or leave blank"
              keyboardType="numeric"
              value={formData.floorLevel}
              onChangeText={(text) => updateFormData({ floorLevel: text })}
            />
      
            <Text style={styles.label}>Furnishing Level <Text style={styles.requiredStar}>*</Text></Text>
            <View style={styles.optionsRow}>
              {([
                { value: "fully_furnished", label: "Fully Furnished" },
                { value: "partially_furnished", label: "Partially Furnished" },
                { value: "unfurnished", label: "Unfurnished" },
              ] as { value: FurnishingLevel; label: string }[]).map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionChip,
                    formData.furnishingLevel === option.value && styles.optionChipSelected,
                  ]}
                  onPress={() => updateFormData({ furnishingLevel: option.value })}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      formData.furnishingLevel === option.value && styles.optionChipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

        case 2:
          return (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pricing & Availability</Text>
        
              <Text style={styles.label}>Monthly Rent (RM) <Text style={styles.requiredStar}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Enter monthly rent"
                keyboardType="numeric"
                value={formData.monthlyRent}
                onChangeText={(text) => updateFormData({ monthlyRent: text })}
              />
        
              <Text style={styles.label}>Security Deposit (RM)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter security deposit"
                keyboardType="numeric"
                value={formData.securityDeposit}
                onChangeText={(text) => updateFormData({ securityDeposit: text })}
              />
        
              <Text style={styles.label}>Utilities Deposit (RM)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter utilities deposit"
                keyboardType="numeric"
                value={formData.utilitiesDeposit}
                onChangeText={(text) => updateFormData({ utilitiesDeposit: text })}
              />
        
              <Text style={styles.label}>Minimum Rental Period (months)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 6, 12"
                keyboardType="numeric"
                value={formData.minimumRentalPeriod}
                onChangeText={(text) => updateFormData({ minimumRentalPeriod: text })}
              />
        
              <Text style={styles.label}>Move-in Date Available</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{formData.availableDate || 'Select available date'}</Text>
              </TouchableOpacity>
        
              {showDatePicker && (
                <DateTimePicker
                  value={availableDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>
          );

      case 3:
        return (
          <ScrollView>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>In-Room Amenities</Text>

              {/* Show bedType only for room/studio */}
              {(formData.propertyType === "room" || formData.propertyType === "studio") && (
                <>
                  <Text style={styles.label}>Bed Type</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Queen, Single, Double"
                    value={formData.bedType}
                    onChangeText={(text) => updateFormData({ bedType: text })}
                  />
                </>
              )}

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Desk & Chair</Text>
                <Switch
                  value={formData.deskAndChair}
                  onValueChange={(value) => updateFormData({ deskAndChair: value })}
                  trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
                  thumbColor={formData.deskAndChair ? "#6366F1" : "#F3F4F6"}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Wardrobe</Text>
                <Switch
                  value={formData.wardrobe}
                  onValueChange={(value) => updateFormData({ wardrobe: value })}
                  trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
                  thumbColor={formData.wardrobe ? "#6366F1" : "#F3F4F6"}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Air Conditioning</Text>
                <Switch
                  value={formData.airConditioning}
                  onValueChange={(value) => updateFormData({ airConditioning: value })}
                  trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
                  thumbColor={formData.airConditioning ? "#6366F1" : "#F3F4F6"}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Water Heater</Text>
                <Switch
                  value={formData.waterHeater}
                  onValueChange={(value) => updateFormData({ waterHeater: value })}
                  trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
                  thumbColor={formData.waterHeater ? "#6366F1" : "#F3F4F6"}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shared Facilities</Text>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>WiFi</Text>
                <Switch
                  value={formData.wifi}
                  onValueChange={(value) => updateFormData({ wifi: value })}
                  trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
                  thumbColor={formData.wifi ? "#6366F1" : "#F3F4F6"}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Kitchen Access</Text>
                <Switch
                  value={formData.kitchenAccess}
                  onValueChange={(value) => updateFormData({ kitchenAccess: value })}
                  trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
                  thumbColor={formData.kitchenAccess ? "#6366F1" : "#F3F4F6"}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Washing Machine</Text>
                <Switch
                  value={formData.washingMachine}
                  onValueChange={(value) => updateFormData({ washingMachine: value })}
                  trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
                  thumbColor={formData.washingMachine ? "#6366F1" : "#F3F4F6"}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Refrigerator</Text>
                <Switch
                  value={formData.refrigerator}
                  onValueChange={(value) => updateFormData({ refrigerator: value })}
                  trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
                  thumbColor={formData.refrigerator ? "#6366F1" : "#F3F4F6"}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Parking</Text>
                <Switch
                  value={formData.parking}
                  onValueChange={(value) => updateFormData({ parking: value })}
                  trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
                  thumbColor={formData.parking ? "#6366F1" : "#F3F4F6"}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Security (CCTV/Guard)</Text>
                <Switch
                  value={formData.security}
                  onValueChange={(value) => updateFormData({ security: value })}
                  trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
                  thumbColor={formData.security ? "#6366F1" : "#F3F4F6"}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Balcony/Common Area</Text>
                <Switch
                  value={formData.balcony}
                  onValueChange={(value) => updateFormData({ balcony: value })}
                  trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
                  thumbColor={formData.balcony ? "#6366F1" : "#F3F4F6"}
                />
              </View>
            </View>
          </ScrollView>
        );

      case 4:
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Utilities & Bills</Text>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Utilities Included in Rent</Text>
              <Switch
                value={formData.utilitiesIncluded}
                onValueChange={(value) => updateFormData({ utilitiesIncluded: value })}
                trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
                thumbColor={formData.utilitiesIncluded ? "#6366F1" : "#F3F4F6"}
              />
            </View>

            {!formData.utilitiesIncluded && (
              <>
                <Text style={styles.label}>Estimated Monthly Utilities (RM)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 50-100"
                  value={formData.estimatedMonthlyUtilities}
                  onChangeText={(text) =>
                    updateFormData({ estimatedMonthlyUtilities: text })
                  }
                />
              </>
            )}

            <Text style={styles.label}>Internet Speed/Package</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 100 Mbps, Included"
              value={formData.internetSpeed}
              onChangeText={(text) => updateFormData({ internetSpeed: text })}
            />
          </View>
        );

      case 5:
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>House Rules</Text>
            
            <Text style={styles.label}>Cooking Policy <Text style={styles.requiredStar}>*</Text></Text>
            <View style={styles.optionsRow}>
              {[
                { value: "allowed", label: "Allowed" },
                { value: "light_cooking", label: "Light Cooking Only" },
                { value: "no_cooking", label: "No Cooking" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionChip,
                    formData.cooking === option.value && styles.optionChipSelected,
                  ]}
                  onPress={() => updateFormData({ cooking: option.value })}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      formData.cooking === option.value && styles.optionChipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Guests Allowed</Text>
              <Switch
                value={formData.guestsAllowed}
                onValueChange={(value) => updateFormData({ guestsAllowed: value })}
                trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
                thumbColor={formData.guestsAllowed ? "#6366F1" : "#F3F4F6"}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Smoking Allowed</Text>
              <Switch
                value={formData.smokingAllowed}
                onValueChange={(value) => updateFormData({ smokingAllowed: value })}
                trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
                thumbColor={formData.smokingAllowed ? "#6366F1" : "#F3F4F6"}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Pets Allowed</Text>
              <Switch
                value={formData.petsAllowed}
                onValueChange={(value) => updateFormData({ petsAllowed: value })}
                trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
                thumbColor={formData.petsAllowed ? "#6366F1" : "#F3F4F6"}
              />
            </View>

            <Text style={styles.label}>Quiet Hours</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 10 PM - 7 AM"
              value={formData.quietHours}
              onChangeText={(text) => updateFormData({ quietHours: text })}
            />

            <Text style={styles.label}>Cleaning/Maintenance Rules</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Describe cleaning and maintenance expectations..."
              multiline
              value={formData.cleaningRules}
              onChangeText={(text) => updateFormData({ cleaningRules: text })}
            />
          </View>
        );

      case 6:
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Information</Text>
      
            {/* Map Picker */}
            <MapPicker
              region={region}
              setRegion={setRegion}
              onLocationSelect={({ latitude, longitude, address }) => {
                updateFormData({ latitude, longitude, address });
                setRegion({
                  latitude,
                  longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                });
              }}
            />
        
            {/* Manual address input */}
            <Text style={styles.label}>
              Address <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              multiline
              placeholder="Type address or adjust pin on map"
              value={formData.address}
              onChangeText={async (text) => {
                updateFormData({ address: text });
                try {
                  const results = await Location.geocodeAsync(text);
                  if (results.length > 0) {
                    const { latitude, longitude } = results[0];
                    updateFormData({ latitude, longitude });
                    setRegion({
                      latitude,
                      longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    });
                  }
                } catch (err) {
                  console.warn("Failed to geocode address:", err);
                }
              }}
            />
        
            <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
              Tap on the map to select the exact property location or type the address manually
            </Text>
          </View>
        );

      case 7:
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos & Media</Text>
            <Text style={styles.label}>Property Title <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Cozy Studio in Downtown KL"
              value={formData.title}
              onChangeText={(text) => updateFormData({ title: text })}
            />

            <Text style={styles.label}>Property Description <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Describe your property..."
              multiline
              value={formData.description}
              onChangeText={(text) => updateFormData({ description: text })}
            />

            <Text style={styles.label}>Photos</Text>
            <TouchableOpacity
              style={{
                borderWidth: 2,
                borderColor: "#6366F1",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                marginBottom: 12,
              }}
              onPress={handleAddPhoto}
            >
              <Text style={{ color: "#6366F1", fontWeight: "600" }}>
                Add Photo
              </Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 12, color: "#6B7280" }}>
              {formData.photos?.length || 0} photo(s) selected
            </Text>
          </View>
        );

      case 8:
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Review Your Listing</Text>
            
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Property Type</Text>
              <Text style={styles.reviewValue}>{formData.propertyType || "-"}</Text>
            </View>

            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Title</Text>
              <Text style={styles.reviewValue}>{formData.title || "-"}</Text>
            </View>

            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Monthly Rent</Text>
              <Text style={styles.reviewValue}>RM {formData.monthlyRent || "-"}</Text>
            </View>

            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Size</Text>
              <Text style={styles.reviewValue}>{formData.size || "-"} sq ft</Text>
            </View>

            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Bedrooms/Bathrooms</Text>
              <Text style={styles.reviewValue}>
                {formData.bedrooms || "-"} BR / {formData.bathrooms || "-"} BA
              </Text>
            </View>

            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Address</Text>
              <Text style={styles.reviewValue}>{formData.address || "-"}</Text>
            </View>

            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Description</Text>
              <Text style={styles.reviewValue}>{formData.description || "-"}</Text>
            </View>
          </View>
        );

      case 9:
        return (
          <View style={styles.section}>
            <View style={styles.submitSuccess}>
              <View style={styles.successIcon}>
                <Check size={48} color="#10B981" />
              </View>
              <Text style={styles.successTitle}>Changes Saved!</Text>
              <Text style={styles.successMessage}>
                Your property listing has been updated successfully.
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handlePrevious} style={styles.backButton}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Listing</Text>
          <Text style={styles.stepText}>
            Step {currentStep} of {TOTAL_STEPS}
          </Text>
        </View>
        <Text style={{ fontSize: 14, color: "#C7D2FE", marginBottom: 8 }}>
          {STEP_TITLES[currentStep - 1]}
        </Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, styles.buttonPrevious]}
          onPress={handlePrevious}
          disabled={isSubmitting}
        >
          <ChevronLeft size={20} color="#374151" />
          <Text style={[styles.buttonText, styles.buttonTextPrevious]}>
            {currentStep === 1 ? "Cancel" : "Previous"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, styles.buttonNext]}
          onPress={handleNext}
        >
          <Text style={[styles.buttonText, styles.buttonTextNext]}>
            {currentStep === TOTAL_STEPS ? "Done" : "Next"}
          </Text>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
