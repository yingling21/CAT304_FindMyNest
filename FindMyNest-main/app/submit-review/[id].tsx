import { useRentals } from "@/contexts/RentalsContext";
import { useReviews } from "@/contexts/ReviewsContext";
import { mockProperties } from "@/mocks/properties";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Star, CheckCircle2 } from "lucide-react-native";
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

export default function SubmitReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getTenantRentals } = useRentals();
  const { createReview, hasReviewed } = useReviews();

  const rental = getTenantRentals().find(r => r.id === id);
  const property = mockProperties.find(p => p.id === rental?.propertyId);

  const [locationRating, setLocationRating] = useState<number>(0);
  const [valueRating, setValueRating] = useState<number>(0);
  const [conditionRating, setConditionRating] = useState<number>(0);
  const [landlordRating, setLandlordRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!rental || !property) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Rental not found</Text>
      </View>
    );
  }

  if (hasReviewed(rental.id)) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={["top"]}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color="#1F2937" />
            </Pressable>
            <Text style={styles.headerTitle}>Review</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.alreadyReviewedContainer}>
            <CheckCircle2 size={64} color="#10B981" />
            <Text style={styles.alreadyReviewedTitle}>Review Already Submitted</Text>
            <Text style={styles.alreadyReviewedText}>
              You have already submitted a review for this rental.
            </Text>
            <Pressable
              style={styles.backToRentalsButton}
              onPress={() => router.push("/my-rentals")}
            >
              <Text style={styles.backToRentalsButtonText}>Back to My Rentals</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const overallRating = Math.round(
    (locationRating + valueRating + conditionRating + landlordRating) / 4
  );

  const handleSubmit = async () => {
    if (locationRating === 0 || valueRating === 0 || conditionRating === 0 || landlordRating === 0) {
      Alert.alert("Error", "Please rate all categories");
      return;
    }

    if (comment.trim().length === 0) {
      Alert.alert("Error", "Please enter your comments");
      return;
    }

    try {
      setIsSubmitting(true);
      await createReview(
        rental.propertyId,
        rental.id,
        overallRating,
        locationRating,
        conditionRating,
        valueRating,
        landlordRating,
        comment.trim(),
        rental.startDate,
        rental.endDate || new Date().toISOString()
      );
      Alert.alert("Success", "Review submitted successfully!", [
        {
          text: "OK",
          onPress: () => router.push("/my-rentals"),
        },
      ]);
    } catch (error) {
      console.error("Failed to submit review:", error);
      Alert.alert("Error", "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (rating: number, setRating: (val: number) => void) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => setRating(star)}>
            <Star
              size={32}
              color={star <= rating ? "#F59E0B" : "#E5E7EB"}
              fill={star <= rating ? "#F59E0B" : "transparent"}
            />
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#1F2937" />
          </Pressable>
          <Text style={styles.headerTitle}>Your Review</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.propertyCard}>
            <Image
              source={{ uri: rental.propertyImage }}
              style={styles.propertyImage}
              contentFit="cover"
            />
            <Text style={styles.propertyTitle}>{rental.propertyTitle}</Text>
            <Text style={styles.rentalDates}>
              Rented: {new Date(rental.startDate).toLocaleDateString("en-MY", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })} - {new Date(rental.endDate || new Date()).toLocaleDateString("en-MY", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>

          <View style={styles.overallRatingCard}>
            <Text style={styles.overallRatingLabel}>Overall Rating</Text>
            <View style={styles.overallRatingBadge}>
              <Star size={48} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.overallRatingValue}>
                {overallRating > 0 ? overallRating.toFixed(1) : "0.0"}
              </Text>
            </View>
          </View>

          <View style={styles.ratingsSection}>
            <View style={styles.ratingItem}>
              <View style={styles.ratingHeader}>
                <Text style={styles.ratingLabel}>Location</Text>
                <Text style={styles.ratingValue}>{locationRating}/5</Text>
              </View>
              {renderStarRating(locationRating, setLocationRating)}
            </View>

            <View style={styles.ratingItem}>
              <View style={styles.ratingHeader}>
                <Text style={styles.ratingLabel}>Value for Money</Text>
                <Text style={styles.ratingValue}>{valueRating}/5</Text>
              </View>
              {renderStarRating(valueRating, setValueRating)}
            </View>

            <View style={styles.ratingItem}>
              <View style={styles.ratingHeader}>
                <Text style={styles.ratingLabel}>Property Condition</Text>
                <Text style={styles.ratingValue}>{conditionRating}/5</Text>
              </View>
              {renderStarRating(conditionRating, setConditionRating)}
            </View>

            <View style={styles.ratingItem}>
              <View style={styles.ratingHeader}>
                <Text style={styles.ratingLabel}>Landlord</Text>
                <Text style={styles.ratingValue}>{landlordRating}/5</Text>
              </View>
              {renderStarRating(landlordRating, setLandlordRating)}
            </View>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.commentsLabel}>Your Comments</Text>
            <TextInput
              style={styles.commentsInput}
              placeholder="Share your experience with this property..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={comment}
              onChangeText={setComment}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{comment.length}/500</Text>
          </View>

          <View style={styles.verifiedBadge}>
            <CheckCircle2 size={20} color="#10B981" />
            <Text style={styles.verifiedText}>Verified Rental</Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Text>
          </Pressable>
        </View>
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
  propertyCard: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  propertyImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  rentalDates: {
    fontSize: 13,
    color: "#6B7280",
  },
  overallRatingCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  overallRatingLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 16,
  },
  overallRatingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  overallRatingValue: {
    fontSize: 48,
    fontWeight: "700" as const,
    color: "#F59E0B",
  },
  ratingsSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ratingItem: {
    marginBottom: 24,
  },
  ratingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6366F1",
  },
  starContainer: {
    flexDirection: "row",
    gap: 8,
  },
  commentsSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  commentsLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 12,
  },
  commentsInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#1F2937",
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  characterCount: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 8,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  verifiedText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#10B981",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  submitButton: {
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  alreadyReviewedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  alreadyReviewedTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  alreadyReviewedText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  backToRentalsButton: {
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  backToRentalsButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
