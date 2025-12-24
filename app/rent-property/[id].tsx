import { useAuth } from "@/contexts/AuthContext";
import { useRentals } from "@/contexts/RentalsContext";
import { mockProperties } from "@/mocks/properties";
import { Image } from "expo-image";
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
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PaymentMethod = "fpx" | "card" | "ewallet";

export default function RentPropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { createRental } = useRentals();

  const property = mockProperties.find((p) => p.id === id);

  const [step, setStep] = useState<number>(1);
  const [duration, setDuration] = useState<number>(12);
  const [customDuration, setCustomDuration] = useState<string>("");
  const [moveInDate, setMoveInDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("fpx");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Property not found</Text>
      </View>
    );
  }

  const availableDate = new Date(property.moveInDate);
  const selectedDate = new Date(moveInDate);
  const endDate = new Date(selectedDate);
  endDate.setMonth(endDate.getMonth() + duration);

  const firstMonthRent = property.monthlyRent;
  const securityDeposit = property.securityDeposit;
  const totalUpfront = firstMonthRent + securityDeposit;

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

  const handleProceedToPayment = () => {
    if (selectedDate < availableDate) {
      Alert.alert(
        "Invalid Date",
        `Property is only available from ${availableDate.toLocaleDateString("en-MY")}`
      );
      return;
    }
    setStep(2);
  };

  const handleConfirmPayment = async () => {
    if (!user) {
      Alert.alert("Error", "Please sign in to continue");
      return;
    }

    setIsProcessing(true);
    try {
      await createRental(
        property.id,
        property.title,
        property.photos && property.photos.length > 0 ? property.photos[0] : "",
        property.address,
        property.landlordId,
        property.monthlyRent,
        property.securityDeposit,
        moveInDate,
        duration
      );

      Alert.alert(
        "Payment Successful",
        "Your rental has been confirmed! You can view it in My Rentals.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)/profile"),
          },
        ]
      );
    } catch (error) {
      console.error("Payment failed:", error);
      Alert.alert("Payment Failed", "Please try again later");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => (step === 2 ? setStep(1) : router.back())} style={styles.backButton}>
            <ChevronLeft size={24} color="#1F2937" />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {step === 1 ? "Rental Details" : "Payment"}
            </Text>
            <Text style={styles.headerSubtitle}>Step {step} of 2</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.propertyCard}>
            <Image
              source={{ uri: property.photos && property.photos.length > 0 ? property.photos[0] : "" }}
              style={styles.propertyImage}
              contentFit="cover"
            />
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyName}>{property.title}</Text>
              <Text style={styles.propertyPrice}>RM {property.monthlyRent}/mo</Text>
            </View>
          </View>

          {step === 1 ? (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rental Duration</Text>
                <View style={styles.durationOptions}>
                  <Pressable
                    style={[
                      styles.durationButton,
                      duration === 6 && styles.durationButtonActive,
                    ]}
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
                    style={[
                      styles.durationButton,
                      duration === 12 && styles.durationButtonActive,
                    ]}
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
                    style={[
                      styles.durationButton,
                      duration === 24 && styles.durationButtonActive,
                    ]}
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

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Move-in Date</Text>
                <View style={styles.dateInputContainer}>
                  <Calendar size={20} color="#6366F1" />
                  <TextInput
                    style={styles.dateInput}
                    value={moveInDate}
                    onChangeText={setMoveInDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <Text style={styles.availableFromText}>
                  Available from {availableDate.toLocaleDateString("en-MY", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </Text>
              </View>

              <View style={styles.rentalPeriodCard}>
                <Text style={styles.rentalPeriodTitle}>Rental Period</Text>
                <View style={styles.rentalPeriodDates}>
                  <Text style={styles.rentalPeriodDate}>
                    Start: {selectedDate.toLocaleDateString("en-MY", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </Text>
                  <Text style={styles.rentalPeriodDate}>
                    End: {endDate.toLocaleDateString("en-MY", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment Summary</Text>
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>First Month Rent</Text>
                    <Text style={styles.summaryValue}>RM {firstMonthRent}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Security Deposit</Text>
                    <Text style={styles.summaryValue}>RM {securityDeposit}</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryTotalLabel}>Total Upfront Payment</Text>
                    <Text style={styles.summaryTotalValue}>RM {totalUpfront}</Text>
                  </View>
                </View>
              </View>

              <Pressable
                style={styles.proceedButton}
                onPress={handleProceedToPayment}
              >
                <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Payment Method</Text>
                <Pressable
                  style={[
                    styles.paymentMethodCard,
                    paymentMethod === "fpx" && styles.paymentMethodCardActive,
                  ]}
                  onPress={() => setPaymentMethod("fpx")}
                >
                  <View style={styles.paymentMethodIcon}>
                    <Building2 size={24} color="#6366F1" />
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={styles.paymentMethodTitle}>FPX Online Banking</Text>
                    <Text style={styles.paymentMethodSubtitle}>
                      All Malaysian banks supported
                    </Text>
                  </View>
                  {paymentMethod === "fpx" && (
                    <CheckCircle2 size={24} color="#6366F1" />
                  )}
                </Pressable>

                <Pressable
                  style={[
                    styles.paymentMethodCard,
                    paymentMethod === "card" && styles.paymentMethodCardActive,
                  ]}
                  onPress={() => setPaymentMethod("card")}
                >
                  <View style={styles.paymentMethodIcon}>
                    <CreditCard size={24} color="#6366F1" />
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={styles.paymentMethodTitle}>Credit / Debit Card</Text>
                    <Text style={styles.paymentMethodSubtitle}>
                      Visa, Mastercard accepted
                    </Text>
                  </View>
                  {paymentMethod === "card" && (
                    <CheckCircle2 size={24} color="#6366F1" />
                  )}
                </Pressable>

                <Pressable
                  style={[
                    styles.paymentMethodCard,
                    paymentMethod === "ewallet" && styles.paymentMethodCardActive,
                  ]}
                  onPress={() => setPaymentMethod("ewallet")}
                >
                  <View style={styles.paymentMethodIcon}>
                    <Wallet size={24} color="#6366F1" />
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={styles.paymentMethodTitle}>E-Wallet</Text>
                    <Text style={styles.paymentMethodSubtitle}>
                      Touch n Go, GrabPay, Boost
                    </Text>
                  </View>
                  {paymentMethod === "ewallet" && (
                    <CheckCircle2 size={24} color="#6366F1" />
                  )}
                </Pressable>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment Summary</Text>
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>First Month Rent</Text>
                    <Text style={styles.summaryValue}>RM {firstMonthRent}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Security Deposit</Text>
                    <Text style={styles.summaryValue}>RM {securityDeposit}</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryTotalLabel}>Total to Pay</Text>
                    <Text style={styles.summaryTotalValue}>RM {totalUpfront}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.securePaymentNotice}>
                <CheckCircle2 size={20} color="#10B981" />
                <Text style={styles.securePaymentText}>
                  <Text style={styles.securePaymentBold}>Secure Payment</Text>
                  {"\n"}Your payment is protected with industry-standard encryption
                  and security measures.
                </Text>
              </View>

              <View style={styles.buttonRow}>
                <Pressable style={styles.backPaymentButton} onPress={() => setStep(1)}>
                  <Text style={styles.backPaymentButtonText}>Back</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.confirmButton,
                    isProcessing && styles.confirmButtonDisabled,
                  ]}
                  onPress={handleConfirmPayment}
                  disabled={isProcessing}
                >
                  <Text style={styles.confirmButtonText}>
                    {isProcessing ? "Processing..." : "Confirm Payment"}
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  errorText: {
    fontSize: 18,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  propertyCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  propertyImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  propertyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  propertyName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#6366F1",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 12,
  },
  durationOptions: {
    flexDirection: "row",
    gap: 12,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  durationButtonActive: {
    borderColor: "#6366F1",
    backgroundColor: "#EEF2FF",
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  durationButtonTextActive: {
    color: "#6366F1",
  },
  customDurationInput: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#1F2937",
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  dateInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
  },
  availableFromText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
  },
  rentalPeriodCard: {
    backgroundColor: "#EEF2FF",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  rentalPeriodTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6366F1",
    marginBottom: 8,
  },
  rentalPeriodDates: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rentalPeriodDate: {
    fontSize: 13,
    color: "#4F46E5",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#6366F1",
  },
  proceedButton: {
    backgroundColor: "#6366F1",
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  paymentMethodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  paymentMethodCardActive: {
    borderColor: "#6366F1",
    backgroundColor: "#F5F7FF",
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 2,
  },
  paymentMethodSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  securePaymentNotice: {
    flexDirection: "row",
    backgroundColor: "#ECFDF5",
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  securePaymentText: {
    flex: 1,
    fontSize: 12,
    color: "#065F46",
    lineHeight: 18,
  },
  securePaymentBold: {
    fontWeight: "700" as const,
  },
  buttonRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  backPaymentButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  backPaymentButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
