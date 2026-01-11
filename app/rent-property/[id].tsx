import { useAuth } from "@/contexts/AuthContext";
import { useRentals } from "@/contexts/RentalsContext";
import type { Property } from "@/src/types";
import { Image } from "expo-image";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Calendar,
  CreditCard,
  Wallet,
  Building2,
  CheckCircle2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  Alert,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "@/styles/rent-property.styles";

export default function RentPropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { createRental } = useRentals();

  const [property, setProperty] = React.useState<Property | null>(null);
  const [isLoadingProperty, setIsLoadingProperty] = React.useState(true);

  React.useEffect(() => {
    const loadProperty = async () => {
      if (!id) {
        setIsLoadingProperty(false);
        return;
      }
      try {
        const { getPropertyById } = await import('@/src/api/properties');
        const data = await getPropertyById(id);
        setProperty(data);
      } catch (error) {
        console.error('Failed to load property:', error);
      } finally {
        setIsLoadingProperty(false);
      }
    };
    loadProperty();
  }, [id]);

  // Single-step flow: configure rental details and send request
  const [step] = useState<number>(1);
  const [duration, setDuration] = useState<number>(12);
  const [moveInDate, setMoveInDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDuration, setCustomDuration] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Set default moveInDate to availableDate when property loads
  React.useEffect(() => {
    if (property && property.availableDate) {
      const availableDate = new Date(property.availableDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      availableDate.setHours(0, 0, 0, 0);
      
      // If availableDate is today or in the past, default to tomorrow
      // If availableDate is in the future, default to one day after availableDate
      const defaultMoveInDate = new Date(availableDate);
      if (availableDate <= today) {
        // Available now, so default to tomorrow
        defaultMoveInDate.setDate(today.getDate() + 1);
      } else {
        // Available in the future, default to one day after availableDate
        defaultMoveInDate.setDate(availableDate.getDate() + 1);
      }
      setMoveInDate(defaultMoveInDate);
    }
  }, [property]);

  if (isLoadingProperty) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Loading...</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Property not found</Text>
      </View>
    );
  }

  const availableDate = new Date(property.availableDate);
  const selectedDate = moveInDate;
  const endDate = new Date(selectedDate);
  endDate.setMonth(endDate.getMonth() + duration);

  const firstMonthRent = property.monthlyRent;
  const securityDeposit = property.securityDeposit;
  const utilitiesDeposit = property.utilitiesDeposit || 0;
  const totalUpfront = firstMonthRent + securityDeposit + utilitiesDeposit;

  const handleDurationSelect = (months: number) => {
    setDuration(months);
    setCustomDuration("");
  };

  const handleCustomDurationChange = (text: string) => {
    setCustomDuration(text);
    const num = parseInt(text);
    if (!isNaN(num) && num > 0) {
      setDuration(num);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // keep open on iOS
    if (selectedDate && property) {
      const availableDate = new Date(property.availableDate);
      // Ensure selected date is after availableDate
      if (selectedDate > availableDate) {
        setMoveInDate(selectedDate);
      } else {
        Alert.alert(
          "Invalid Date",
          `Move-in date must be after ${availableDate.toLocaleDateString("en-MY")}`
        );
      }
    }
  };

  const handleSubmitRentalRequest = async () => {
    // Ensure moveInDate is strictly greater than availableDate
    if (selectedDate <= availableDate) {
      Alert.alert(
        "Invalid Date",
        `Move-in date must be after ${availableDate.toLocaleDateString("en-MY")}`
      );
      return;
    }

    if (!user) {
      Alert.alert("Error", "Please sign in to continue");
      return;
    }

    setIsProcessing(true);
    try {
      await createRental(
        property.id,
        property.address,
        property.photos[0]?.url || '',
        property.landlordId,
        property.monthlyRent,
        property.securityDeposit,
        moveInDate.toISOString(),
        duration
      );

      Alert.alert(
        "Request Sent",
        "Your rental request has been sent to the landlord. You will be notified once it is approved, then you can pay from My Rentals.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/my-rentals"),
          },
        ]
      );
    } catch (error) {
      console.error("Failed to submit rental request:", error);
      Alert.alert("Error", "Failed to submit rental request. Please try again later");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#1F2937" />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Rental Details</Text>
            <Text style={styles.headerSubtitle}>Step 1 of 1</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Property summary */}
          <View style={styles.propertyCard}>
            <Image
              source={{ uri: property.photos[0]?.url || "https://via.placeholder.com/400" }}
              style={styles.propertyImage}
              contentFit="cover"
            />
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyName}>
                {`${property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)} at ${
                  property.address.split(",")[0]
                }`}
              </Text>
              <Text style={styles.propertyPrice}>RM {property.monthlyRent}/mo</Text>
            </View>
          </View>

          {/* Rental duration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rental Duration</Text>
            <View style={styles.durationOptions}>
              <Pressable
                style={[styles.durationButton, duration === 6 && styles.durationButtonActive]}
                onPress={() => handleDurationSelect(6)}
              >
                <Text
                  style={[
                    styles.durationButtonText,
                    duration === 6 && styles.durationButtonTextActive,
                  ]}
                >
                  6 months
                </Text>
              </Pressable>
              <Pressable
                style={[styles.durationButton, duration === 12 && styles.durationButtonActive]}
                onPress={() => handleDurationSelect(12)}
              >
                <Text
                  style={[
                    styles.durationButtonText,
                    duration === 12 && styles.durationButtonTextActive,
                  ]}
                >
                  12 months
                </Text>
              </Pressable>
              <Pressable
                style={[styles.durationButton, duration === 24 && styles.durationButtonActive]}
                onPress={() => handleDurationSelect(24)}
              >
                <Text
                  style={[
                    styles.durationButtonText,
                    duration === 24 && styles.durationButtonTextActive,
                  ]}
                >
                  24 months
                </Text>
              </Pressable>
            </View>
            <TextInput
              style={styles.customDurationInput}
              placeholder="Or enter custom duration (months)"
              keyboardType="numeric"
              value={customDuration}
              onChangeText={handleCustomDurationChange}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Move-in date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Move-in Date</Text>
            <TouchableOpacity
              style={styles.dateInputContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color="#6366F1" />
              <Text style={styles.dateInput}>{moveInDate.toLocaleDateString("en-MY")}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={moveInDate}
                mode="date"
                display="default"
                minimumDate={new Date(availableDate.getTime() + 24 * 60 * 60 * 1000)}
                onChange={handleDateChange}
              />
            )}

            <Text style={styles.availableFromText}>
              Available from{" "}
              {availableDate.toLocaleDateString("en-MY", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Text>
          </View>

          {/* Rental period summary */}
          <View style={styles.rentalPeriodCard}>
            <Text style={styles.rentalPeriodTitle}>Rental Period</Text>
            <View style={styles.rentalPeriodDates}>
              <Text style={styles.rentalPeriodDate}>
                Start:{" "}
                {selectedDate.toLocaleDateString("en-MY", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </Text>
              <Text style={styles.rentalPeriodDate}>
                End:{" "}
                {endDate.toLocaleDateString("en-MY", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>

          {/* Upfront payment summary (for info only) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upfront Amount (after approval)</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>First Month Rent</Text>
                <Text style={styles.summaryValue}>RM {firstMonthRent}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Security Deposit</Text>
                <Text style={styles.summaryValue}>RM {securityDeposit}</Text>
              </View>
              {utilitiesDeposit > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Utilities Deposit</Text>
                  <Text style={styles.summaryValue}>RM {utilitiesDeposit}</Text>
                </View>
              )}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Total Upfront</Text>
                <Text style={styles.summaryTotalValue}>RM {totalUpfront}</Text>
              </View>
            </View>
          </View>

          {/* Submit request */}
          <Pressable
            style={[styles.proceedButton, isProcessing && styles.confirmButtonDisabled]}
            onPress={handleSubmitRentalRequest}
            disabled={isProcessing}
          >
            <Text style={styles.proceedButtonText}>
              {isProcessing ? "Sending Request..." : "Send Rental Request"}
            </Text>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
  );
}
