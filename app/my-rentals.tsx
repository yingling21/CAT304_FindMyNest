import { useAuth } from "@/contexts/AuthContext";
import { useRentals } from "@/contexts/RentalsContext";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft, Home as HomeIcon } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "@/styles/rent-property.styles";

export default function MyRentalsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getTenantRentals, stopRental } = useRentals();
  const [stoppingRentalId, setStoppingRentalId] = useState<string | null>(null);

  const rentals = getTenantRentals();
  const activeRentals = rentals.filter(r => r.status === "active");
  const pastRentals = rentals.filter(r => r.status !== "active");

  const calculateDaysRemaining = (endDate: string | undefined): number => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleStopRent = (rental: any) => {
    Alert.alert(
      "Stop Rental",
      `Are you sure you want to stop renting at "${rental.propertyAddress}"? You will be asked to submit a review after stopping.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop Rent",
          style: "destructive",
          onPress: async () => {
            try {
              setStoppingRentalId(rental.id);
              await stopRental(rental.id);
              setStoppingRentalId(null);
              router.push(`/submit-review/${rental.id}` as any);
            } catch (error) {
              console.error("Failed to stop rental:", error);
              Alert.alert("Error", "Failed to stop rental. Please try again.");
              setStoppingRentalId(null);
            }
          },
        },
      ]
    );
  };

  const handlePayRent = (rental: any) => {
    Alert.alert(
      "Pay Rent",
      `Pay RM ${rental.monthlyRent} for property at ${rental.propertyAddress}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pay Now",
          onPress: () => {
            Alert.alert("Success", "Payment processed successfully!");
          },
        },
      ]
    );
  };

  if (!user || user.role !== "tenant") {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Access denied</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#1F2937" />
          </Pressable>
          <Text style={styles.headerTitle}>My Rentals</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.myRentalsScrollView} showsVerticalScrollIndicator={false}>
          {activeRentals.length === 0 && pastRentals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <HomeIcon size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Rentals Yet</Text>
              <Text style={styles.emptySubtitle}>
                Start renting a property to see it here
              </Text>
            </View>
          ) : (
            <>
              {activeRentals.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Active Rentals</Text>
                  {activeRentals.map((rental) => {
                    const daysRemaining = calculateDaysRemaining(rental.endDate);
                    const startDate = new Date(rental.startDate);
                    const endDate = rental.endDate ? new Date(rental.endDate) : null;

                    return (
                      <View key={rental.id} style={styles.rentalCard}>
                        <Image
                          source={{ uri: rental.propertyImage }}
                          style={styles.propertyImage}
                          contentFit="cover"
                        />
                        <View style={styles.rentalInfo}>
                          <View style={styles.rentalHeader}>
                            <Text style={styles.propertyTitle} numberOfLines={1}>
                              {rental.propertyAddress}
                            </Text>
                            <View style={styles.statusBadge}>
                              <Text style={styles.statusText}>Active</Text>
                            </View>
                          </View>
                          <Text style={styles.propertyAddress} numberOfLines={1}>
                            {rental.propertyAddress}
                          </Text>
                          <Text style={styles.propertyPrice}>
                            RM {rental.monthlyRent}/mo
                          </Text>
                          <Text style={styles.rentalPeriod}>
                            {startDate.toLocaleDateString("en-MY", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}{" "}
                            -{" "}
                            {endDate
                              ? endDate.toLocaleDateString("en-MY", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Ongoing"}
                          </Text>
                          <Text style={styles.daysRemaining}>
                            {daysRemaining} days remaining
                          </Text>
                        </View>
                        <View style={styles.actionButtons}>
                          <Pressable
                            style={styles.payButton}
                            onPress={() => handlePayRent(rental)}
                          >
                            <Text style={styles.payButtonText}>Pay Rent</Text>
                          </Pressable>
                          <Pressable
                            style={[
                              styles.stopButton,
                              stoppingRentalId === rental.id && styles.stopButtonDisabled,
                            ]}
                            onPress={() => handleStopRent(rental)}
                            disabled={stoppingRentalId === rental.id}
                          >
                            <Text style={styles.stopButtonText}>
                              {stoppingRentalId === rental.id ? "Stopping..." : "Stop Rent"}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {pastRentals.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Past Rentals</Text>
                  {pastRentals.map((rental) => {
                    const startDate = new Date(rental.startDate);
                    const endDate = rental.endDate ? new Date(rental.endDate) : null;

                    return (
                      <View key={rental.id} style={styles.rentalCard}>
                        <Image
                          source={{ uri: rental.propertyImage }}
                          style={styles.propertyImage}
                          contentFit="cover"
                        />
                        <View style={styles.rentalInfo}>
                          <View style={styles.rentalHeader}>
                            <Text style={styles.propertyTitle} numberOfLines={1}>
                              {rental.propertyAddress}
                            </Text>
                            <View style={styles.statusBadgeCompleted}>
                              <Text style={styles.statusTextCompleted}>Completed</Text>
                            </View>
                          </View>
                          <Text style={styles.propertyAddress} numberOfLines={1}>
                            {rental.propertyAddress}
                          </Text>
                          <Text style={styles.propertyPrice}>
                            RM {rental.monthlyRent}/mo
                          </Text>
                          <Text style={styles.rentalPeriod}>
                            {startDate.toLocaleDateString("en-MY", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}{" "}
                            -{" "}
                            {endDate
                              ? endDate.toLocaleDateString("en-MY", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Ongoing"}
                          </Text>
                        </View>
                        {rental.hasReview ? (
                          <View style={styles.reviewSubmittedBadge}>
                            <Text style={styles.reviewSubmittedText}>Review submitted</Text>
                          </View>
                        ) : (
                          <Pressable
                            style={styles.reviewButton}
                            onPress={() => router.push(`/submit-review/${rental.id}` as any)}
                          >
                            <Text style={styles.reviewButtonText}>Submit Review</Text>
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
