import { useAuth } from "@/contexts/AuthContext";
import { useRentals } from "@/contexts/RentalsContext";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft, Home as HomeIcon, User, Calendar, DollarSign } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { landlordRentalsStyles as styles } from "@/styles/landlord";

export default function LandlordRentalsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getLandlordRentals } = useRentals();

  const rentals = getLandlordRentals();
  const activeRentals = rentals.filter(r => r.status === "active");
  const pastRentals = rentals.filter(r => r.status !== "active");

  const getTenantInfo = (tenantId: string) => {
    return {
      name: "Ng",
      email: "tan.landlord@gmail.com",
      phone: "60123456789",
    };
  };

  const getPaymentStatus = (rental: any) => {
    return {
      status: "paid" as const,
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      lastPaymentDate: new Date(),
    };
  };

  if (!user || user.role !== "landlord") {
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

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {activeRentals.length === 0 && pastRentals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <HomeIcon size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Rentals Yet</Text>
              <Text style={styles.emptySubtitle}>
                Your rented properties will appear here
              </Text>
            </View>
          ) : (
            <>
              {activeRentals.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Active Rentals</Text>
                  {activeRentals.map((rental) => {
                    const tenantInfo = getTenantInfo(rental.tenantId);
                    const paymentStatus = getPaymentStatus(rental);
                    const startDate = new Date(rental.startDate);
                    const endDate = rental.endDate ? new Date(rental.endDate) : null;

                    return (
                      <View key={rental.id} style={styles.rentalCard}>
                        <View style={styles.propertySection}>
                          <Image
                            source={{ uri: rental.propertyImage }}
                            style={styles.propertyImage}
                            contentFit="cover"
                          />
                          <View style={styles.propertyInfo}>
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
                          </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoSection}>
                          <View style={styles.infoRow}>
                            <View style={styles.infoIconContainer}>
                              <User size={18} color="#6366F1" />
                            </View>
                            <View style={styles.infoContent}>
                              <Text style={styles.infoLabel}>Tenant</Text>
                              <Text style={styles.infoValue}>{tenantInfo.name}</Text>
                              <Text style={styles.infoSubValue}>{tenantInfo.email}</Text>
                              <Text style={styles.infoSubValue}>{tenantInfo.phone}</Text>
                            </View>
                          </View>

                          <View style={styles.infoRow}>
                            <View style={styles.infoIconContainer}>
                              <Calendar size={18} color="#10B981" />
                            </View>
                            <View style={styles.infoContent}>
                              <Text style={styles.infoLabel}>Rent Period</Text>
                              <Text style={styles.infoValue}>
                                {startDate.toLocaleDateString("en-MY", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                                {" - "}
                                {endDate
                                  ? endDate.toLocaleDateString("en-MY", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "Ongoing"}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.infoRow}>
                            <View style={styles.infoIconContainer}>
                              <DollarSign size={18} color="#F59E0B" />
                            </View>
                            <View style={styles.infoContent}>
                              <Text style={styles.infoLabel}>Payment Status</Text>
                              <View style={styles.paymentStatusRow}>
                                <View
                                  style={[
                                    styles.paymentStatusBadge,
                                    paymentStatus.status === "paid"
                                      ? styles.paymentStatusPaid
                                      : styles.paymentStatusPending,
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.paymentStatusText,
                                      paymentStatus.status === "paid"
                                        ? styles.paymentStatusTextPaid
                                        : styles.paymentStatusTextPending,
                                    ]}
                                  >
                                    {paymentStatus.status === "paid" ? "Paid" : "Pending"}
                                  </Text>
                                </View>
                              </View>
                              <Text style={styles.infoSubValue}>
                                Last payment:{" "}
                                {paymentStatus.lastPaymentDate.toLocaleDateString("en-MY", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </Text>
                              <Text style={styles.infoSubValue}>
                                Next due:{" "}
                                {paymentStatus.dueDate.toLocaleDateString("en-MY", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </Text>
                            </View>
                          </View>
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
                    const tenantInfo = getTenantInfo(rental.tenantId);
                    const startDate = new Date(rental.startDate);
                    const endDate = rental.endDate ? new Date(rental.endDate) : null;

                    return (
                      <View key={rental.id} style={styles.rentalCard}>
                        <View style={styles.propertySection}>
                          <Image
                            source={{ uri: rental.propertyImage }}
                            style={styles.propertyImage}
                            contentFit="cover"
                          />
                          <View style={styles.propertyInfo}>
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
                          </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoSection}>
                          <View style={styles.infoRow}>
                            <View style={styles.infoIconContainer}>
                              <User size={18} color="#6366F1" />
                            </View>
                            <View style={styles.infoContent}>
                              <Text style={styles.infoLabel}>Tenant</Text>
                              <Text style={styles.infoValue}>{tenantInfo.name}</Text>
                            </View>
                          </View>

                          <View style={styles.infoRow}>
                            <View style={styles.infoIconContainer}>
                              <Calendar size={18} color="#10B981" />
                            </View>
                            <View style={styles.infoContent}>
                              <Text style={styles.infoLabel}>Rent Period</Text>
                              <Text style={styles.infoValue}>
                                {startDate.toLocaleDateString("en-MY", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                                {" - "}
                                {endDate
                                  ? endDate.toLocaleDateString("en-MY", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "Ongoing"}
                              </Text>
                            </View>
                          </View>
                        </View>
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

