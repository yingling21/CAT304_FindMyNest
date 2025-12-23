import { useAuth } from "@/contexts/AuthContext";
import { useReviews } from "@/contexts/ReviewsContext";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft, Star, MapPin } from "lucide-react-native";
import React, { useState, useMemo } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { allReviewsStyles as styles } from "@/styles/landlord";

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

