import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useMessages } from "@/contexts/MessagesContext";
import { useReviews } from "@/contexts/ReviewsContext";
import type { Property } from "@/types";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  Bed,
  Bath,
  Maximize2,
  Heart,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Wifi,
  Car,
  Shield,
  Wind,
  Utensils,
  WashingMachine,
  Refrigerator,
  Star,
  MessageCircle,
  CheckCircle2,
  Armchair,
  Droplet,

} from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../../styles/property.styles";

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { createOrGetConversation } = useMessages();
  const { getReviewsByProperty } = useReviews();
  const insets = useSafeAreaInsets();

  const properties: Property[] = [];
  const property = properties.find((p) => p.id === id);
  const reviews = getReviewsByProperty(id || "");

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Property not found</Text>
      </View>
    );
  }

  const favorite = isFavorite(property.id);

  const handleFavoritePress = () => {
    toggleFavorite(property.id);
  };

  const handleContactLandlord = async () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to contact the landlord");
      return;
    }

    try {
      const conversationId = await createOrGetConversation(
        property.id,
        property.description.substring(0, 50),
        property.photos[0]?.url || '',
        property.monthlyRent,
        property.landlordId,
        property.landlordName,
        property.landlordPhoto
      );
      router.push(`/chat/${conversationId}` as any);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      Alert.alert("Error", "Failed to start conversation. Please try again.");
    }
  };

  const handleRentNow = () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to rent this property");
      return;
    }
    router.push(`/rent-property/${property.id}` as any);
  };

  const formatFurnishing = (level: string): string => {
    if (level === "fully_furnished") return "Fully Furnished";
    if (level === "partially_furnished") return "Partially Furnished";
    return "Unfurnished";
  };



  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerTransparent: true,
          headerRight: () => (
            <Pressable
              onPress={handleFavoritePress}
              style={styles.headerFavoriteButton}
            >
              <Heart
                size={24}
                color={favorite ? "#EF4444" : "#1F2937"}
                fill={favorite ? "#EF4444" : "transparent"}
              />
            </Pressable>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.photoSection}>
          <Image
            source={{ uri: property.photos[currentPhotoIndex]?.url || 'https://via.placeholder.com/400' }}
            style={styles.mainPhoto}
            contentFit="cover"
          />
          {property.photos.length > 1 && (
            <View style={styles.photoIndicators}>
              {property.photos.map((_, index: number) => (
                <Pressable
                  key={index}
                  onPress={() => setCurrentPhotoIndex(index)}
                  style={[
                    styles.photoIndicator,
                    currentPhotoIndex === index && styles.photoIndicatorActive,
                  ]}
                />
              ))}
            </View>
          )}
          {property.photos.length > 1 && (
            <View style={styles.photoCounter}>
              <Text style={styles.photoCounterText}>
                {currentPhotoIndex + 1} / {property.photos.length}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <View style={styles.badges}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {property.propertyType.charAt(0).toUpperCase() +
                    property.propertyType.slice(1)}
                </Text>
              </View>
              {property.rentalStatus && (
                <View style={styles.availableBadge}>
                  <Text style={styles.availableBadgeText}>Available Now</Text>
                </View>
              )}
            </View>
            <Text style={styles.title}>{property.description.length > 100 ? property.description.substring(0, 100) + '...' : property.description}</Text>
            <View style={styles.locationRow}>
              <MapPin size={18} color="#6B7280" />
              <Text style={styles.address}>{property.address}</Text>
            </View>
          </View>

          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>RM {property.monthlyRent}</Text>
              <Text style={styles.priceLabel}>/month</Text>
            </View>

          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Bed size={20} color="#6366F1" />
                <Text style={styles.detailLabel}>Bedrooms</Text>
                <Text style={styles.detailValue}>{property.bedrooms}</Text>
              </View>
              <View style={styles.detailItem}>
                <Bath size={20} color="#6366F1" />
                <Text style={styles.detailLabel}>Bathrooms</Text>
                <Text style={styles.detailValue}>{property.bathrooms}</Text>
              </View>
              <View style={styles.detailItem}>
                <Maximize2 size={20} color="#6366F1" />
                <Text style={styles.detailLabel}>Size</Text>
                <Text style={styles.detailValue}>{property.size} sqft</Text>
              </View>
              <View style={styles.detailItem}>
                <Armchair size={20} color="#6366F1" />
                <Text style={styles.detailLabel}>Furnishing</Text>
                <Text style={styles.detailValue}>
                  {formatFurnishing(property.furnishingLevel)}
                </Text>
              </View>

            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities & Facilities</Text>
            <View style={styles.amenitiesGrid}>
              {property.amenities.bedType && (
                <View style={styles.amenityItem}>
                  <Bed size={20} color="#6366F1" />
                  <Text style={styles.amenityText}>
                    {property.amenities.bedType} Bed
                  </Text>
                </View>
              )}
              {property.amenities.deskAndChair && (
                <View style={styles.amenityItem}>
                  <CheckCircle2 size={20} color="#10B981" />
                  <Text style={styles.amenityText}>Desk & Chair</Text>
                </View>
              )}
              {property.amenities.wardrobe && (
                <View style={styles.amenityItem}>
                  <CheckCircle2 size={20} color="#10B981" />
                  <Text style={styles.amenityText}>Wardrobe</Text>
                </View>
              )}
              {property.amenities.airConditioning && (
                <View style={styles.amenityItem}>
                  <Wind size={20} color="#10B981" />
                  <Text style={styles.amenityText}>Air Conditioning</Text>
                </View>
              )}
              {property.amenities.waterHeater && (
                <View style={styles.amenityItem}>
                  <Droplet size={20} color="#10B981" />
                  <Text style={styles.amenityText}>Water Heater</Text>
                </View>
              )}
              {property.amenities.wifi && (
                <View style={styles.amenityItem}>
                  <Wifi size={20} color="#10B981" />
                  <Text style={styles.amenityText}>WiFi</Text>
                </View>
              )}
              {property.amenities.kitchenAccess && (
                <View style={styles.amenityItem}>
                  <Utensils size={20} color="#10B981" />
                  <Text style={styles.amenityText}>Kitchen Access</Text>
                </View>
              )}
              {property.amenities.washingMachine && (
                <View style={styles.amenityItem}>
                  <WashingMachine size={20} color="#10B981" />
                  <Text style={styles.amenityText}>Washing Machine</Text>
                </View>
              )}
              {property.amenities.refrigerator && (
                <View style={styles.amenityItem}>
                  <Refrigerator size={20} color="#10B981" />
                  <Text style={styles.amenityText}>Refrigerator</Text>
                </View>
              )}
              {property.amenities.parking && (
                <View style={styles.amenityItem}>
                  <Car size={20} color="#10B981" />
                  <Text style={styles.amenityText}>Parking</Text>
                </View>
              )}
              {property.amenities.security && (
                <View style={styles.amenityItem}>
                  <Shield size={20} color="#10B981" />
                  <Text style={styles.amenityText}>Security</Text>
                </View>
              )}
              {property.amenities.balcony && (
                <View style={styles.amenityItem}>
                  <CheckCircle2 size={20} color="#10B981" />
                  <Text style={styles.amenityText}>Balcony</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rental Terms</Text>
            <View style={styles.termsContainer}>
              <View style={styles.termRow}>
                <DollarSign size={20} color="#6B7280" />
                <View style={styles.termContent}>
                  <Text style={styles.termLabel}>Security Deposit</Text>
                  <Text style={styles.termValue}>
                    RM {property.securityDeposit}
                  </Text>
                </View>
              </View>
              <View style={styles.termRow}>
                <DollarSign size={20} color="#6B7280" />
                <View style={styles.termContent}>
                  <Text style={styles.termLabel}>Utilities Deposit</Text>
                  <Text style={styles.termValue}>
                    RM {property.utilitiesDeposit}
                  </Text>
                </View>
              </View>
              <View style={styles.termRow}>
                <Clock size={20} color="#6B7280" />
                <View style={styles.termContent}>
                  <Text style={styles.termLabel}>Minimum Rental Period</Text>
                  <Text style={styles.termValue}>
                    {property.minimumRentalPeriod}{" "}
                    {property.minimumRentalPeriod === 1 ? "month" : "months"}
                  </Text>
                </View>
              </View>
              <View style={styles.termRow}>
                <Calendar size={20} color="#6B7280" />
                <View style={styles.termContent}>
                  <Text style={styles.termLabel}>Available From</Text>
                  <Text style={styles.termValue}>
                    {new Date(property.moveInDate).toLocaleDateString("en-MY", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>

          <View style={styles.divider} />



          {reviews.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <View style={styles.reviewsHeader}>
                  <Text style={styles.sectionTitle}>Reviews</Text>
                  <View style={styles.ratingBadge}>
                    <Star size={16} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.ratingText}>
                      {property.averageRating.toFixed(1)}
                    </Text>
                    <Text style={styles.reviewCount}>
                      ({property.totalReviews})
                    </Text>
                  </View>
                </View>
                {reviews.map((review) => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Image
                        source={{
                          uri:
                            review.tenantPhoto ||
                            "https://i.pravatar.cc/150?u=default",
                        }}
                        style={styles.reviewerPhoto}
                      />
                      <View style={styles.reviewerInfo}>
                        <View style={styles.reviewerNameRow}>
                          <Text style={styles.reviewerName}>
                            {review.tenantName}
                          </Text>
                          {review.tenantVerified && (
                            <CheckCircle2 size={14} color="#10B981" />
                          )}
                        </View>
                        <Text style={styles.reviewDate}>
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-MY",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </Text>
                      </View>
                      <View style={styles.reviewRating}>
                        <Star size={14} color="#F59E0B" fill="#F59E0B" />
                        <Text style={styles.reviewRatingText}>
                          {review.rating.toFixed(1)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                    <View style={styles.reviewRatings}>
                      <View style={styles.reviewRatingDetail}>
                        <Text style={styles.reviewRatingLabel}>Location</Text>
                        <View style={styles.reviewRatingStars}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              color={
                                i < review.locationRating ? "#F59E0B" : "#E5E7EB"
                              }
                              fill={
                                i < review.locationRating ? "#F59E0B" : "#E5E7EB"
                              }
                            />
                          ))}
                        </View>
                      </View>
                      <View style={styles.reviewRatingDetail}>
                        <Text style={styles.reviewRatingLabel}>Condition</Text>
                        <View style={styles.reviewRatingStars}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              color={
                                i < review.conditionRating
                                  ? "#F59E0B"
                                  : "#E5E7EB"
                              }
                              fill={
                                i < review.conditionRating
                                  ? "#F59E0B"
                                  : "#E5E7EB"
                              }
                            />
                          ))}
                        </View>
                      </View>
                      <View style={styles.reviewRatingDetail}>
                        <Text style={styles.reviewRatingLabel}>Value</Text>
                        <View style={styles.reviewRatingStars}>
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
                      <View style={styles.reviewRatingDetail}>
                        <Text style={styles.reviewRatingLabel}>Landlord</Text>
                        <View style={styles.reviewRatingStars}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              color={
                                i < review.landlordRating ? "#F59E0B" : "#E5E7EB"
                              }
                              fill={
                                i < review.landlordRating ? "#F59E0B" : "#E5E7EB"
                              }
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Landlord Information</Text>
            <View style={styles.landlordCard}>
              <Image
                source={{
                  uri:
                    property.landlordPhoto ||
                    "https://i.pravatar.cc/150?u=landlord",
                }}
                style={styles.landlordPhoto}
              />
              <View style={styles.landlordInfo}>
                <View style={styles.landlordNameRow}>
                  <Text style={styles.landlordName}>
                    {property.landlordName}
                  </Text>
                  {property.landlordVerified && (
                    <CheckCircle2 size={16} color="#10B981" />
                  )}
                </View>
                <Text style={styles.landlordLabel}>Property Owner</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable
          style={styles.contactButton}
          onPress={handleContactLandlord}
        >
          <MessageCircle size={20} color="#6366F1" />
          <Text style={styles.contactButtonText}>Contact Landlord</Text>
        </Pressable>
        <Pressable style={styles.rentButton} onPress={handleRentNow}>
          <Text style={styles.rentButtonText}>Rent Now</Text>
        </Pressable>
      </View>
    </>
  );
}
