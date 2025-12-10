import { useAuth } from "@/contexts/AuthContext";
import { useReviews } from "@/contexts/ReviewsContext";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft, Star, MapPin } from "lucide-react-native";
import React, { useState, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabType = "all" | "property";

export default function AllReviewsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { reviews } = useReviews();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const landlordReviews = useMemo(() => {
    if (!user) return [];
    return reviews.filter(review => {
      return true;
    });
  }, [reviews, user]);

  const propertyOptions = useMemo(() => {
    const uniqueProperties = new Map();
    landlordReviews.forEach(review => {
      if (!uniqueProperties.has(review.propertyId)) {
        uniqueProperties.set(review.propertyId, {
          id: review.propertyId,
          title: "house in gurun",
        });
      }
    });
    return [
      { id: "all", title: "All Properties" },
      ...Array.from(uniqueProperties.values()),
    ];
  }, [landlordReviews]);

  const filteredReviews = useMemo(() => {
    let filtered = landlordReviews;
    
    if (activeTab === "property" && selectedProperty !== "all") {
      filtered = filtered.filter(review => review.propertyId === selectedProperty);
    }
    
    return filtered;
  }, [landlordReviews, activeTab, selectedProperty]);

  const averageRating = useMemo(() => {
    if (filteredReviews.length === 0) return 0;
    return filteredReviews.reduce((acc, review) => acc + review.rating, 0) / filteredReviews.length;
  }, [filteredReviews]);

  const ratingDistribution = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    filteredReviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  }, [filteredReviews]);

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
          <Text style={styles.headerTitle}>All Reviews</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.ratingCard}>
            <Text style={styles.ratingScore}>{averageRating.toFixed(1)}</Text>
            <View style={styles.ratingStars}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  color={i < Math.floor(averageRating) ? "#F59E0B" : "#D1D5DB"}
                  fill={i < Math.floor(averageRating) ? "#F59E0B" : "transparent"}
                />
              ))}
            </View>
            <Text style={styles.ratingCount}>{filteredReviews.length} total reviews</Text>

            <View style={styles.distributionContainer}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <View key={rating} style={styles.distributionRow}>
                  <Text style={styles.distributionLabel}>{rating}</Text>
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <View style={styles.distributionBarContainer}>
                    <View
                      style={[
                        styles.distributionBar,
                        {
                          width: `${
                            filteredReviews.length > 0
                              ? (ratingDistribution[rating as keyof typeof ratingDistribution] /
                                  filteredReviews.length) *
                                100
                              : 0
                          }%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.distributionCount}>
                    {ratingDistribution[rating as keyof typeof ratingDistribution]}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tab, activeTab === "all" && styles.tabActive]}
              onPress={() => setActiveTab("all")}
            >
              <Text style={[styles.tabText, activeTab === "all" && styles.tabTextActive]}>
                All Reviews
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === "property" && styles.tabActive]}
              onPress={() => setActiveTab("property")}
            >
              <Text style={[styles.tabText, activeTab === "property" && styles.tabTextActive]}>
                Property Reviews
              </Text>
            </Pressable>
          </View>

          {activeTab === "property" && (
            <View style={styles.filterContainer}>
              <Pressable
                style={styles.dropdown}
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <MapPin size={16} color="#6B7280" />
                <Text style={styles.dropdownText}>
                  {propertyOptions.find(p => p.id === selectedProperty)?.title || "All Properties"}
                </Text>
              </Pressable>
              
              {isDropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {propertyOptions.map((property) => (
                    <Pressable
                      key={property.id}
                      style={[
                        styles.dropdownItem,
                        property.id === selectedProperty && styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedProperty(property.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          property.id === selectedProperty && styles.dropdownItemTextSelected,
                        ]}
                      >
                        {property.title}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.reviewsList}>
            {filteredReviews.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Star size={48} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No Reviews Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Reviews from tenants will appear here
                </Text>
              </View>
            ) : (
              filteredReviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerAvatar}>
                      <Text style={styles.reviewerAvatarText}>
                        {review.tenantName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>{review.tenantName}</Text>
                      {activeTab === "all" && (
                        <View style={styles.propertyBadge}>
                          <Text style={styles.propertyBadgeText}>Property Review</Text>
                        </View>
                      )}
                      <View style={styles.propertyLocation}>
                        <MapPin size={12} color="#9CA3AF" />
                        <Text style={styles.propertyLocationText}>house in gurun</Text>
                      </View>
                    </View>
                    <View style={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          color={i < review.rating ? "#F59E0B" : "#D1D5DB"}
                          fill={i < review.rating ? "#F59E0B" : "transparent"}
                        />
                      ))}
                    </View>
                  </View>
                  
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                  
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              ))
            )}
          </View>

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
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  scrollView: {
    flex: 1,
  },
  ratingCard: {
    backgroundColor: "#6366F1",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  ratingScore: {
    fontSize: 48,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  ratingStars: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  ratingCount: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 24,
  },
  distributionContainer: {
    width: "100%",
    gap: 8,
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  distributionLabel: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600" as const,
    width: 12,
  },
  distributionBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  distributionBar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600" as const,
    width: 20,
    textAlign: "right",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#6366F1",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  filterContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    zIndex: 1000,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  dropdownText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemSelected: {
    backgroundColor: "#6366F1",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#1F2937",
  },
  dropdownItemTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600" as const,
  },
  reviewsList: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reviewerAvatarText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  propertyBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  propertyBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#6366F1",
  },
  propertyLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  propertyLocationText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  reviewRating: {
    flexDirection: "row",
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});
