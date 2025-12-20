// app/property/[id].tsx
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useMessages } from "@/contexts/MessagesContext";
import { useReviews } from "@/contexts/ReviewsContext";
// import { mockProperties } from "@/mocks/properties";
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
  Cable,
  Home,
  Ban,
  PawPrint,
  Users,
  Cigarette,
  Volume2,
  Sparkles,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { createOrGetConversation } = useMessages();
  const { getReviewsByProperty } = useReviews();
  const insets = useSafeAreaInsets();

  const property = mockProperties.find((p) => p.id === id);
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
    // 🔑 TEMP: use a REAL UUID from public.users
    const landlordUserId = "128b79b5-944d-4d45-a6fa-a09e10a83c5d";

    console.log("Using landlord UUID:", landlordUserId);

    const conversationId = await createOrGetConversation(
      Number(property.id),              // ensure number
      property.title,
      property.photos[0],
      property.monthlyRent,
      landlordUserId,                   // ✅ UUID
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

  const formatRoomType = (type?: string): string => {
    if (!type) return "";
    if (type === "master_room") return "Master Room";
    if (type === "single_room") return "Single Room";
    if (type === "shared_room") return "Shared Room";
    return "";
  };

  const formatCooking = (policy: string): string => {
    if (policy === "allowed") return "Cooking Allowed";
    if (policy === "light_cooking") return "Light Cooking Only";
    return "No Cooking";
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
            source={{ uri: property.photos[currentPhotoIndex] }}
            style={styles.mainPhoto}
            contentFit="cover"
          />
          {property.photos.length > 1 && (
            <View style={styles.photoIndicators}>
              {property.photos.map((_, index) => (
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
              {property.rentalStatus === "available" && (
                <View style={styles.availableBadge}>
                  <Text style={styles.availableBadgeText}>Available Now</Text>
                </View>
              )}
            </View>
            <Text style={styles.title}>{property.title}</Text>
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
            {!property.utilitiesIncluded &&
              property.estimatedMonthlyUtilities && (
                <Text style={styles.utilitiesInfo}>
                  + RM {property.estimatedMonthlyUtilities} utilities (est.)
                </Text>
              )}
            {property.utilitiesIncluded && (
              <View style={styles.utilitiesIncludedBadge}>
                <CheckCircle2 size={14} color="#10B981" />
                <Text style={styles.utilitiesIncludedText}>
                  Utilities Included
                </Text>
              </View>
            )}
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
              {property.floorLevel && (
                <View style={styles.detailItem}>
                  <Home size={20} color="#6366F1" />
                  <Text style={styles.detailLabel}>Floor Level</Text>
                  <Text style={styles.detailValue}>{property.floorLevel}</Text>
                </View>
              )}
              {property.roomType && (
                <View style={styles.detailItem}>
                  <Bed size={20} color="#6366F1" />
                  <Text style={styles.detailLabel}>Room Type</Text>
                  <Text style={styles.detailValue}>
                    {formatRoomType(property.roomType)}
                  </Text>
                </View>
              )}
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Utilities & Expenses</Text>
            <View style={styles.utilitiesContainer}>
              {property.utilitiesIncluded ? (
                <View style={styles.utilitiesIncludedBox}>
                  <CheckCircle2 size={24} color="#10B981" />
                  <Text style={styles.utilitiesIncludedTitle}>
                    All Utilities Included in Rent
                  </Text>
                  {property.estimatedMonthlyUtilities && (
                    <Text style={styles.utilitiesIncludedSubtitle}>
                      Estimated value: RM {property.estimatedMonthlyUtilities}
                      /mo
                    </Text>
                  )}
                </View>
              ) : (
                <>
                  <View style={styles.utilitiesNotIncludedBox}>
                    <Cable size={24} color="#F59E0B" />
                    <Text style={styles.utilitiesNotIncludedTitle}>
                      Utilities Paid Separately
                    </Text>
                    {property.estimatedMonthlyUtilities && (
                      <Text style={styles.utilitiesEstimate}>
                        Estimated: RM {property.estimatedMonthlyUtilities}/mo
                      </Text>
                    )}
                  </View>
                  <Text style={styles.utilitiesNote}>
                    Includes water, electricity, and WiFi charges
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>House Rules</Text>
            <View style={styles.rulesContainer}>
              <View style={styles.ruleRow}>
                <Utensils size={20} color="#6366F1" />
                <Text style={styles.ruleText}>
                  {formatCooking(property.houseRules.cooking)}
                </Text>
              </View>
              <View style={styles.ruleRow}>
                {property.houseRules.guestsAllowed ? (
                  <Users size={20} color="#10B981" />
                ) : (
                  <Ban size={20} color="#EF4444" />
                )}
                <Text style={styles.ruleText}>
                  Guests {property.houseRules.guestsAllowed ? "Allowed" : "Not Allowed"}
                </Text>
              </View>
              <View style={styles.ruleRow}>
                {property.houseRules.smokingAllowed ? (
                  <Cigarette size={20} color="#10B981" />
                ) : (
                  <Ban size={20} color="#EF4444" />
                )}
                <Text style={styles.ruleText}>
                  Smoking {property.houseRules.smokingAllowed ? "Allowed" : "Not Allowed"}
                </Text>
              </View>
              <View style={styles.ruleRow}>
                {property.houseRules.petsAllowed ? (
                  <PawPrint size={20} color="#10B981" />
                ) : (
                  <Ban size={20} color="#EF4444" />
                )}
                <Text style={styles.ruleText}>
                  Pets {property.houseRules.petsAllowed ? "Allowed" : "Not Allowed"}
                </Text>
              </View>
              {property.houseRules.quietHours && (
                <View style={styles.ruleRow}>
                  <Volume2 size={20} color="#6366F1" />
                  <Text style={styles.ruleText}>
                    Quiet Hours: {property.houseRules.quietHours}
                  </Text>
                </View>
              )}
              {property.houseRules.cleaningRules && (
                <View style={styles.ruleRow}>
                  <Sparkles size={20} color="#6366F1" />
                  <Text style={styles.ruleText}>
                    {property.houseRules.cleaningRules}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationContainer}>
              <View style={styles.addressBox}>
                <MapPin size={20} color="#6366F1" />
                <Text style={styles.addressText}>{property.address}</Text>
              </View>
              <View style={styles.landmarksContainer}>
                <Text style={styles.landmarksTitle}>Nearby Landmarks</Text>
                {property.nearbyLandmarks.map((landmark, index) => (
                  <Text key={index} style={styles.landmarkItem}>
                    • {landmark}
                  </Text>
                ))}
              </View>
              <View style={styles.transportBox}>
                <Text style={styles.transportText}>
                  🚇 {property.distanceToTransport}
                </Text>
              </View>
            </View>
          </View>

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
  headerFavoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  photoSection: {
    position: "relative",
  },
  mainPhoto: {
    width: width,
    height: 300,
  },
  photoIndicators: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  photoIndicatorActive: {
    backgroundColor: "#FFFFFF",
    width: 24,
  },
  photoCounter: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  photoCounterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  badges: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  typeBadge: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  availableBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  availableBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  address: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  priceSection: {
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#6366F1",
  },
  priceLabel: {
    fontSize: 16,
    color: "#9CA3AF",
    marginLeft: 6,
  },
  utilitiesInfo: {
    fontSize: 14,
    color: "#F59E0B",
    marginTop: 4,
  },
  utilitiesIncludedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  utilitiesIncludedText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600" as const,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  detailItem: {
    width: (width - 56) / 2,
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 14,
    color: "#1F2937",
  },
  termsContainer: {
    gap: 16,
  },
  termRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  termContent: {
    flex: 1,
  },
  termLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  termValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  utilitiesContainer: {
    gap: 12,
  },
  utilitiesIncludedBox: {
    backgroundColor: "#ECFDF5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  utilitiesIncludedTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#10B981",
  },
  utilitiesIncludedSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  utilitiesNotIncludedBox: {
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  utilitiesNotIncludedTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#F59E0B",
  },
  utilitiesEstimate: {
    fontSize: 14,
    color: "#92400E",
  },
  utilitiesNote: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic" as const,
    textAlign: "center",
  },
  rulesContainer: {
    gap: 16,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ruleText: {
    fontSize: 14,
    color: "#1F2937",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
  },
  locationContainer: {
    gap: 16,
  },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
  },
  addressText: {
    fontSize: 14,
    color: "#1F2937",
    flex: 1,
  },
  landmarksContainer: {
    gap: 8,
  },
  landmarksTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  landmarkItem: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 12,
  },
  transportBox: {
    backgroundColor: "#EEF2FF",
    padding: 12,
    borderRadius: 8,
  },
  transportText: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "600" as const,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  reviewCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  reviewCard: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  reviewDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reviewRatingText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  reviewComment: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewRatings: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  reviewRatingDetail: {
    alignItems: "center",
    gap: 4,
  },
  reviewRatingLabel: {
    fontSize: 10,
    color: "#6B7280",
  },
  reviewRatingStars: {
    flexDirection: "row",
    gap: 2,
  },
  landlordCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
  },
  landlordPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  landlordInfo: {
    flex: 1,
  },
  landlordNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  landlordName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  landlordLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#6366F1",
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#6366F1",
  },
  rentButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  rentButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
