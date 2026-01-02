import { useAuth } from "@/contexts/AuthContext";
import { useRentals } from "@/contexts/RentalsContext";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft, Home as HomeIcon, User as UserIcon, Calendar, DollarSign, CheckCircle2, XCircle } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { landlordRentalsStyles as styles } from "@/styles/landlord";
import { getUserById } from "@/src/api/users";
import type { User } from "@/src/types/user";

export default function LandlordRentalsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getLandlordRentals, updateRentalStatus, stopRental } = useRentals();

  const rentals = getLandlordRentals();
  const now = new Date();
  
  // State for tenant information
  const [tenantInfoMap, setTenantInfoMap] = useState<Record<string, User>>({});
  const [loadingTenants, setLoadingTenants] = useState<Record<string, boolean>>({});
  const [confirmingRentalId, setConfirmingRentalId] = useState<string | null>(null);
  const [stoppingRentalId, setStoppingRentalId] = useState<string | null>(null);
  
  // Pending rentals (waiting for landlord confirmation)
  const pendingRentals = rentals.filter(r => r.status === "pending");
  
  // Confirmed rentals (landlord confirmed but start date hasn't arrived yet)
  const confirmedRentals = rentals.filter(r => {
    if (r.status !== "confirmed") return false;
    const startDate = new Date(r.startDate);
    return startDate > now;
  });
  
  // Active rentals (confirmed and start date has passed)
  const activeRentals = rentals.filter(r => {
    if (r.status === "active") {
      const startDate = new Date(r.startDate);
      return startDate <= now;
    }
    // Also include confirmed rentals where start date has passed (auto-activate)
    if (r.status === "confirmed") {
      const startDate = new Date(r.startDate);
      return startDate <= now;
    }
    return false;
  });
  
  // Past rentals (completed or cancelled)
  const pastRentals = rentals.filter(r => 
    r.status === "completed" || r.status === "cancelled"
  );

  // Fetch tenant information
  useEffect(() => {
    const fetchTenantInfo = async () => {
      const uniqueTenantIds = [...new Set(rentals.map(r => r.tenantId))];
      
      for (const tenantId of uniqueTenantIds) {
        if (tenantInfoMap[tenantId] || loadingTenants[tenantId]) continue;
        
        setLoadingTenants(prev => ({ ...prev, [tenantId]: true }));
        try {
          const tenant = await getUserById(tenantId);
          if (tenant) {
            setTenantInfoMap(prev => ({ ...prev, [tenantId]: tenant }));
          }
        } catch (error) {
          console.error(`Failed to fetch tenant ${tenantId}:`, error);
        } finally {
          setLoadingTenants(prev => ({ ...prev, [tenantId]: false }));
        }
      }
    };

    if (rentals.length > 0) {
      fetchTenantInfo();
    }
  }, [rentals]);

  const getTenantInfo = (tenantId: string) => {
    const tenant = tenantInfoMap[tenantId];
    if (!tenant) {
      return {
        name: "Loading...",
        email: "",
        phone: "",
      };
    }
    return {
      name: tenant.fullName,
      email: tenant.email,
      phone: tenant.phoneNumber,
    };
  };

  const handleConfirmRental = (rental: any) => {
    Alert.alert(
      "Confirm Rental",
      `Are you sure you want to confirm the rental for "${rental.propertyAddress}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setConfirmingRentalId(rental.id);
              await updateRentalStatus(rental.id, "confirmed");
              setConfirmingRentalId(null);
              Alert.alert("Success", "Rental confirmed successfully");
            } catch (error) {
              console.error("Failed to confirm rental:", error);
              Alert.alert("Error", "Failed to confirm rental. Please try again.");
              setConfirmingRentalId(null);
            }
          },
        },
      ]
    );
  };

  const handleStopRental = (rental: any) => {
    Alert.alert(
      "Stop Rental",
      `Are you sure you want to stop the rental for "${rental.propertyAddress}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop Rental",
          style: "destructive",
          onPress: async () => {
            try {
              setStoppingRentalId(rental.id);
              await stopRental(rental.id);
              setStoppingRentalId(null);
              Alert.alert("Success", "Rental stopped successfully");
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

  const handleCancelRental = (rental: any) => {
    Alert.alert(
      "Cancel Rental",
      `Are you sure you want to cancel the rental for "${rental.propertyAddress}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Cancel Rental",
          style: "destructive",
          onPress: async () => {
            try {
              setStoppingRentalId(rental.id);
              await updateRentalStatus(rental.id, "cancelled");
              setStoppingRentalId(null);
              Alert.alert("Success", "Rental cancelled successfully");
            } catch (error) {
              console.error("Failed to cancel rental:", error);
              Alert.alert("Error", "Failed to cancel rental. Please try again.");
              setStoppingRentalId(null);
            }
          },
        },
      ]
    );
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
          {activeRentals.length === 0 && pastRentals.length === 0 && pendingRentals.length === 0 && confirmedRentals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <HomeIcon size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Rentals Yet</Text>
              <Text style={styles.emptySubtitle}>
                Your rented properties will appear here
              </Text>
            </View>
          ) : (
            <>
              {pendingRentals.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Pending Rentals</Text>
                  {pendingRentals.map((rental) => {
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
                              <View style={[styles.statusBadge, { backgroundColor: "#F59E0B" }]}>
                                <Text style={styles.statusText}>Pending</Text>
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
                              <UserIcon size={18} color="#6366F1" />
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
                              <Text style={[styles.infoSubValue, { color: "#F59E0B", marginTop: 4 }]}>
                                Waiting for your confirmation
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.actionButtons}>
                          <Pressable
                            style={[styles.actionButton, styles.confirmButton]}
                            onPress={() => handleConfirmRental(rental)}
                            disabled={confirmingRentalId === rental.id}
                          >
                            {confirmingRentalId === rental.id ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <>
                                <CheckCircle2 size={18} color="#FFFFFF" />
                                <Text style={styles.confirmButtonText}>Confirm Rental</Text>
                              </>
                            )}
                          </Pressable>
                          <Pressable
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={() => handleCancelRental(rental)}
                            disabled={stoppingRentalId === rental.id}
                          >
                            {stoppingRentalId === rental.id ? (
                              <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                              <>
                                <XCircle size={18} color="#EF4444" />
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                              </>
                            )}
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {confirmedRentals.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Upcoming Rentals</Text>
                  {confirmedRentals.map((rental) => {
                    const tenantInfo = getTenantInfo(rental.tenantId);
                    const startDate = new Date(rental.startDate);
                    const endDate = rental.endDate ? new Date(rental.endDate) : null;
                    const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

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
                              <View style={[styles.statusBadge, { backgroundColor: "#10B981" }]}>
                                <Text style={styles.statusText}>Confirmed</Text>
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
                              <UserIcon size={18} color="#6366F1" />
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
                              <Text style={[styles.infoSubValue, { color: "#10B981", marginTop: 4 }]}>
                                Starts in {daysUntilStart} {daysUntilStart === 1 ? "day" : "days"}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.actionButtons}>
                          <Pressable
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={() => handleCancelRental(rental)}
                            disabled={stoppingRentalId === rental.id}
                          >
                            {stoppingRentalId === rental.id ? (
                              <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                              <>
                                <XCircle size={18} color="#EF4444" />
                                <Text style={styles.cancelButtonText}>Cancel Rental</Text>
                              </>
                            )}
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {activeRentals.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Active Rentals</Text>
                  {activeRentals.map((rental) => {
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
                              <UserIcon size={18} color="#6366F1" />
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

                        </View>

                        <View style={styles.actionButtons}>
                          <Pressable
                            style={[styles.actionButton, styles.stopButton]}
                            onPress={() => handleStopRental(rental)}
                            disabled={stoppingRentalId === rental.id}
                          >
                            {stoppingRentalId === rental.id ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <>
                                <XCircle size={18} color="#FFFFFF" />
                                <Text style={styles.stopButtonText}>Stop Rental</Text>
                              </>
                            )}
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
                              <UserIcon size={18} color="#6366F1" />
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

