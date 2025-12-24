import { useRentals } from "@/contexts/RentalsContext";
import { useReviews } from "@/contexts/ReviewsContext";
import type { Property } from "@/src/types";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Star, CheckCircle2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "@/styles/submit-review";

export default function SubmitReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getTenantRentals } = useRentals();
  const { createReview, hasReviewed } = useReviews();

  const rental = getTenantRentals().find(r => r.id === id);
  const [property, setProperty] = React.useState<Property | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadProperty = async () => {
      if (!rental?.propertyId) {
        setIsLoading(false);
        return;
      }
      try {
        const { getPropertyById } = await import('@/src/api/properties');
        const data = await getPropertyById(rental.propertyId);
        setProperty(data);
      } catch (error) {
        console.error('Failed to load property:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProperty();
  }, [rental?.propertyId]);

  const [locationRating, setLocationRating] = useState<number>(0);
  const [valueRating, setValueRating] = useState<number>(0);
  const [conditionRating, setConditionRating] = useState<number>(0);
  const [landlordRating, setLandlordRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
            <Text style={styles.propertyTitle}>{rental.propertyAddress}</Text>
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
