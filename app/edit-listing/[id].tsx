import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, ChevronRight, Check } from "lucide-react-native";
import { useListing } from "@/contexts/ListingContext";
import type { PropertyType, FurnishingLevel } from "@/src/types";
import { styles } from "@/styles/listing";

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
  const { formData, updateFormData, resetFormData } = useListing();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    console.log("Editing listing:", id);
  }, [id]);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      resetFormData();
      router.back();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

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
                  onPress={() => updateFormData({ propertyType: type })}
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

            <Text style={styles.label}>Floor Level</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Ground floor, 5th floor"
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
            <TextInput
              style={styles.input}
              placeholder="e.g., Immediately, January 2025"
              value={formData.moveInDate}
              onChangeText={(text) => updateFormData({ moveInDate: text })}
            />
          </View>
        );

      case 3:
        return (
          <ScrollView>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>In-Room Amenities</Text>

              <Text style={styles.label}>Bed Type</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Queen, Single"
                value={formData.bedType}
                onChangeText={(text) => updateFormData({ bedType: text })}
              />

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

            <Text style={styles.label}>Address <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Enter full address"
              multiline
              value={formData.address}
              onChangeText={(text) => updateFormData({ address: text })}
            />

            <Text style={styles.label}>Nearby Landmarks</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="e.g., Near shopping mall, university..."
              multiline
              value={formData.nearbyLandmarks}
              onChangeText={(text) => updateFormData({ nearbyLandmarks: text })}
            />

            <Text style={styles.label}>Distance to Public Transport</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5 min walk to LRT station"
              value={formData.distanceToTransport}
              onChangeText={(text) => updateFormData({ distanceToTransport: text })}
            />
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
            <View style={{
              borderWidth: 2,
              borderColor: "#D1D5DB",
              borderStyle: "dashed",
              borderRadius: 12,
              padding: 32,
              alignItems: "center",
            }}>
              <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}>
                Photo upload coming soon
              </Text>
              <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                For now, photos can be added after submission
              </Text>
            </View>
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
