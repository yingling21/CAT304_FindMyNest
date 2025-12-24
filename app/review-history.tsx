import { useAuth } from "@/contexts/AuthContext";
import { useReviews } from "@/contexts/ReviewsContext";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft, Star, MessageSquare } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { reviewHistoryStyles as styles } from "@/styles/submit-review";

export default function ReviewHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getReviewsByTenant } = useReviews();

  const reviews = user ? getReviewsByTenant(user.id) : [];

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
          <Text style={styles.headerTitle}>Review History</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {reviews.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MessageSquare size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Reviews Yet</Text>
              <Text style={styles.emptySubtitle}>
                Reviews you submit will appear here
              </Text>
            </View>
          ) : (
            <View style={styles.reviewsList}>
              {reviews.map((review) => {
                const reviewDate = new Date(review.createdAt);
                
                return (
                  <Pressable
                    key={review.id}
                    style={styles.reviewCard}
                    onPress={() => router.push(`/property/${review.propertyId}` as any)}
                  >
                    <Image
                      source={{ 
                        uri: `https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80` 
                      }}
                      style={styles.propertyImage}
                      contentFit="cover"
                    />
                    <View style={styles.reviewContent}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.propertyTitle} numberOfLines={1}>
                          Property #{review.propertyId}
                        </Text>
                        <View style={styles.ratingBadge}>
                          <Star size={14} color="#F59E0B" fill="#F59E0B" />
                          <Text style={styles.ratingText}>{review.rating.toFixed(1)}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.reviewDate}>
                        Reviewed on {reviewDate.toLocaleDateString("en-MY", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </Text>

                      <Text style={styles.comment} numberOfLines={2}>
                        {review.comment}
                      </Text>

                      <View style={styles.ratingsBreakdown}>
                        <View style={styles.ratingDetail}>
                          <Text style={styles.ratingDetailLabel}>Location</Text>
                          <View style={styles.ratingDetailValue}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={10}
                                color={i < review.locationRating ? "#F59E0B" : "#E5E7EB"}
                                fill={i < review.locationRating ? "#F59E0B" : "#E5E7EB"}
                              />
                            ))}
                          </View>
                        </View>

                        <View style={styles.ratingDetail}>
                          <Text style={styles.ratingDetailLabel}>Value</Text>
                          <View style={styles.ratingDetailValue}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={10}
                                color={i < review.valueRating ? "#F59E0B" : "#E5E7EB"}
                                fill={i < review.valueRating ? "#F59E0B" : "#E5E7EB"}
                              />
                            ))}
                          </View>
                        </View>

                        <View style={styles.ratingDetail}>
                          <Text style={styles.ratingDetailLabel}>Condition</Text>
                          <View style={styles.ratingDetailValue}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={10}
                                color={i < review.conditionRating ? "#F59E0B" : "#E5E7EB"}
                                fill={i < review.conditionRating ? "#F59E0B" : "#E5E7EB"}
                              />
                            ))}
                          </View>
                        </View>

                        <View style={styles.ratingDetail}>
                          <Text style={styles.ratingDetailLabel}>Landlord</Text>
                          <View style={styles.ratingDetailValue}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={10}
                                color={i < review.landlordRating ? "#F59E0B" : "#E5E7EB"}
                                fill={i < review.landlordRating ? "#F59E0B" : "#E5E7EB"}
                              />
                            ))}
                          </View>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

