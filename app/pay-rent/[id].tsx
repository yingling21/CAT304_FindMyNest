import { useAuth } from "@/contexts/AuthContext";
import { usePayments } from "@/contexts/PaymentsContext";
import type { Rental } from "@/src/types/rental";
import type { Property } from "@/src/types";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  CreditCard,
  Wallet,
  Building2,
  CheckCircle2,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "@/styles/rent-property.styles";
import { getRentalById } from "@/src/api/rentals";
import { getPropertyById } from "@/src/api/properties";

type PaymentMethod = "fpx" | "card" | "ewallet";

export default function PayRentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // rental id
  const router = useRouter();
  const { user } = useAuth();
  const { createPayment, completePayment } = usePayments();

  const [rental, setRental] = useState<Rental | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("fpx");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      try {
        const rentalData = await getRentalById(id);
        if (!rentalData) {
          setIsLoading(false);
          return;
        }
        setRental(rentalData);

        const propertyData = await getPropertyById(rentalData.propertyId);
        if (propertyData) {
          setProperty(propertyData);
        }
      } catch (error) {
        console.error("Failed to load rental/payment data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (!user || user.role !== "tenant") {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Access denied</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Loading...</Text>
      </View>
    );
  }

  if (!rental || !property) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Rental not found</Text>
      </View>
    );
  }

  // Decide payment type based on rental status
  const paymentType: "initial" | "recurring" =
    rental.status === "confirmed" ? "initial" : "recurring";

  const firstMonthRent = rental.monthlyRent;
  const securityDeposit = rental.securityDeposit;
  const utilitiesDeposit = 0;
  const totalUpfront =
    paymentType === "initial"
      ? firstMonthRent + securityDeposit + utilitiesDeposit
      : firstMonthRent;

  const handleConfirmPayment = async () => {
    try {
      setIsProcessing(true);

      const nextDueDate = new Date();
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);

      const payment = await createPayment(
        rental.id,
        rental.propertyId,
        rental.landlordId,
        paymentType,
        totalUpfront,
        rental.monthlyRent,
        paymentType === "initial" ? securityDeposit : 0,
        paymentType === "initial" ? utilitiesDeposit : 0,
        nextDueDate.toISOString()
      );

      await completePayment(payment.id, paymentMethod);

      Alert.alert(
        "Payment Recorded",
        "Your payment has been recorded successfully!",
        [
          {
            text: "OK",
            onPress: () => router.replace("/my-rentals"),
          },
        ]
      );
    } catch (error) {
      console.error("Payment failed:", error);
      Alert.alert("Error", "Failed to process payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#1F2937" />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {paymentType === "initial" ? "Initial Payment" : "Pay Rent"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {paymentType === "initial"
                ? "Confirm your first payment"
                : "Pay this month's rent"}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Property summary (reused design) */}
          <View style={styles.propertyCard}>
            <Image
              source={{ uri: rental.propertyImage || "https://via.placeholder.com/400" }}
              style={styles.propertyImage}
              contentFit="cover"
            />
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyName}>
                {property.title || rental.propertyAddress}
              </Text>
              <Text style={styles.propertyPrice}>RM {rental.monthlyRent}/mo</Text>
            </View>
          </View>

          {/* Select payment method (same design as original payment step) */}
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

          {/* Payment summary (reused design) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.summaryCard}>
              {paymentType === "initial" && (
                <>
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
                </>
              )}
              {paymentType === "recurring" && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Monthly Rent</Text>
                  <Text style={styles.summaryValue}>RM {firstMonthRent}</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Total to Pay</Text>
                <Text style={styles.summaryTotalValue}>RM {totalUpfront}</Text>
              </View>
            </View>
          </View>

          {/* Secure payment notice & actions (reused design) */}
          <View style={styles.securePaymentNotice}>
            <CheckCircle2 size={20} color="#10B981" />
            <Text style={styles.securePaymentText}>
              <Text style={styles.securePaymentBold}>Secure Payment</Text>
              {"\n"}Your payment is protected with industry-standard encryption
              and security measures.
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={styles.backPaymentButton} onPress={() => router.back()}>
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

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}


