import React, { useState, useEffect, useRef } from "react";
import { ScrollView, Text, View, Pressable, Alert, Button, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapComponent from "@/components/maps/MapComponent";
import NearbyPlaces from "@/components/maps/NearbyPlaces";
import { NearbyPlace, NearbyCounts, PlaceCategory } from "@/src/types/nearby";
import { styles } from "@/styles/property.styles";
import { Image } from "expo-image";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useMessages } from "@/contexts/MessagesContext";
import { useReviews } from "@/contexts/ReviewsContext";
import type { Property } from "@/src/types";
import Constants from "expo-constants";
import {
  Bed,
  Bath,
  Maximize2,
  Heart,
  MapPin,
  Armchair,
  Wind,
  Droplet,
  Wifi,
  Utensils,
  WashingMachine,
  Refrigerator,
  Car,
  Shield,
  CheckCircle2,
  MessageCircle,
  Calendar,
  DollarSign,
  Ban,
  Dog,
  Sparkles,
  Volume2,
  Users,
  Clock,
} from "lucide-react-native";
import { calculateWorthiness, type WorthinessResult } from "@/src/utils/worthinessCalculator";
import MapView, { Marker } from "react-native-maps";

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { createOrGetConversation } = useMessages();
  const { getReviewsByProperty } = useReviews();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photoScrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;
  const [nearbyResults, setNearbyResults] = useState<NearbyPlace[]>([]);
  const [nearbyCounts, setNearbyCounts] = useState<NearbyCounts | null>({
    transport: 0,
    food: 0,
    shopping: 0,
    facility: 0,
    environment: 0,
    education: 0,
  });
  const CATEGORY_COLORS: Record<string, string> = {
    transport: "#6366F1",  // blue
    food: "#F59E0B",       // yellow
    shopping: "#10B981",   // green
    facility: "#EF4444",   // red
    environment: "#22D3EE", // teal
    education: "#A78BFA",   // purple
    other: "#9CA3AF",       // gray
  };

  const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey;

  const DEFAULT_WEIGHTS: Record<keyof NearbyCounts, number> = {
    transport: 25,
    food: 20,
    shopping: 15,
    facility: 20,
    environment: 10,
    education: 10,
  };

  const [userWeights, setUserWeights] = useState<Record<keyof NearbyCounts, number>>(
    DEFAULT_WEIGHTS
  );

  const [worthiness, setWorthiness] =
    useState<WorthinessResult | null>(null);

  useEffect(() => {
    if (nearbyResults.length > 0) {
      const result = calculateWorthiness(nearbyResults);
      setWorthiness(result); 
    }
  }, [nearbyResults]);
  const totalScore = worthiness?.totalScore ?? 0;
  const categoryScores = worthiness?.categoryScores;

  // Load property
  useEffect(() => {
    const loadProperty = async () => {
      try {
        setIsLoading(true);
        const { getPropertyById } = await import('@/src/api/properties');
        const data = await getPropertyById(id || '');
        if (data) {
          setProperty(data); // safe, data is not null
        } else {
          console.error("Property not found");
          setProperty(null); // still set state so UI can handle it
        }
      } catch (error) {
        console.error('Failed to load property:', error);
        setProperty(null);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchNearbyPlaces = async (lat: number, lng: number) => {
      try {
        const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey;
        if (!apiKey) return;

        const radius = 500; // meters
        const type = "restaurant"; // example
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.results) {
          const places: NearbyPlace[] = data.results.map((p: any) => ({
            id: p.place_id,
            name: p.name,
            types: p.types,
            latitude: p.geometry.location.lat,
            longitude: p.geometry.location.lng,
          }));
          setNearbyResults(places);
        }
      } catch (error) {
        console.error("Failed to fetch nearby places:", error);
      }
    };

    loadProperty();
  }, [id]);

  // Sync scroll position when currentPhotoIndex changes (e.g., when tapping dots)
  useEffect(() => {
    if (property && property.photos.length > 0 && photoScrollViewRef.current) {
      photoScrollViewRef.current.scrollTo({
        x: currentPhotoIndex * screenWidth,
        animated: true,
      });
    }
  }, [currentPhotoIndex, property, screenWidth]);

  const reviews = getReviewsByProperty(id || "");

  if (isLoading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Loading...</Text>
      </View>
    );
  }

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
        property.address,
        property.photos[0]?.url || "",
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
            <Pressable onPress={handleFavoritePress} style={styles.headerFavoriteButton}>
              <Heart size={24} color={favorite ? "#EF4444" : "#1F2937"} fill={favorite ? "#EF4444" : "transparent"} />
            </Pressable>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Photos */}
        <View style={styles.photoSection}>
          <ScrollView
            ref={photoScrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const offsetX = event.nativeEvent.contentOffset.x;
              const index = Math.round(offsetX / screenWidth);
              setCurrentPhotoIndex(index);
            }}
            style={{ width: screenWidth }}
          >
            {property.photos.map((photo, index) => (
              <Image
                key={index}
                source={{ uri: photo.url || "https://via.placeholder.com/400" }}
                style={[styles.mainPhoto, { width: screenWidth }]}
                contentFit="cover"
              />
            ))}
          </ScrollView>
          {property.photos.length > 1 && (
            <View style={styles.photoIndicators}>
              {property.photos.map((_, index) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    setCurrentPhotoIndex(index);
                    photoScrollViewRef.current?.scrollTo({
                      x: index * screenWidth,
                      animated: true,
                    });
                  }}
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

        {/* Content */}
        <View style={styles.content}>
          {/* Title & Address */}
          <View style={styles.titleSection}>
            {/* Badges */}
            <View style={styles.badges}>
              {/* Property Type Badge */}
              {property.propertyType && (
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>
                    {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                  </Text>
                </View>
              )}

              {/* Room Type Badge */}
              {property.roomType && (
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>
                    {property.roomType === "master_room"
                      ? "Master Room"
                      : property.roomType === "single_room"
                      ? "Single Room"
                      : "Shared Room"}
                  </Text>
                </View>
              )}

              {/* Rental Status Badge */}
              {(() => {
                // Check if property is available now (availableDate is today or in the past)
                const isAvailableNow = () => {
                  if (property.approvalStatus !== 'approved') return false;
                  if (!property.availableDate) return false;
                  try {
                    const availableDate = new Date(property.availableDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    availableDate.setHours(0, 0, 0, 0);
                    return availableDate <= today;
                  } catch {
                    return false;
                  }
                };

                // Check if availableDate is in the future
                const isFutureDate = () => {
                  if (!property.availableDate) return false;
                  try {
                    const availableDate = new Date(property.availableDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    availableDate.setHours(0, 0, 0, 0);
                    return availableDate > today;
                  } catch {
                    return false;
                  }
                };

                const formatAvailableDate = (dateString: string) => {
                  try {
                    const date = new Date(dateString);
                    return date.toLocaleDateString("en-MY", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                  } catch {
                    return "Date TBD";
                  }
                };

                const available = isAvailableNow();
                const futureDate = isFutureDate();

                if (available) {
                  return (
                    <View style={styles.availableBadge}>
                      <Text style={styles.availableBadgeText}>Available</Text>
                    </View>
                  );
                } else if (futureDate && property.availableDate) {
                  return (
                    <View style={[styles.availableBadge, { backgroundColor: "#EF4444" }]}>
                      <Text style={styles.availableBadgeText}>
                        {formatAvailableDate(property.availableDate)}
                      </Text>
                    </View>
                  );
                }
                return null;
              })()}
            </View>

            {/* Property Title */}
            {property.title ? <Text style={styles.title}>{property.title}</Text> : null}

            {/* Location */}
            {property.address && (
              <View style={styles.locationRow}>
                <MapPin size={18} color="#6B7280" />
                <Text style={styles.address}>{property.address}</Text>
              </View>
            )}

            {/* Floor Level */}
            {property.floorLevel != null && (
              <Text style={[styles.address, { marginTop: 4 }]}>
                Floor: {property.floorLevel}
              </Text>
            )}
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>RM {property.monthlyRent}</Text>
              <Text style={styles.priceLabel}>/month</Text>
            </View>
            <View style={styles.depositsContainer}>
              <View style={styles.depositCard}>
                <DollarSign size={20} color="#6366F1" />
                <Text style={styles.depositLabel}>Security Deposit</Text>
                <Text style={styles.depositValue}>
                  RM {property.securityDeposit.toLocaleString()}
                </Text>
              </View>
              <View style={styles.depositCard}>
                <DollarSign size={20} color="#6366F1" />
                <Text style={styles.depositLabel}>Utilities Deposit</Text>
                <Text style={styles.depositValue}>
                  RM {property.utilitiesDeposit.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Property Details */}
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
              <View style={[styles.detailItem, { alignItems: "center" }]}>
                <Armchair size={20} color="#6366F1" />
                <Text style={[styles.detailLabel, { textAlign: "center" }]}>Furnishing</Text>
                <Text style={[styles.detailValue, { textAlign: "center" }]}>
                  {formatFurnishing(property.furnishingLevel)}
                </Text>
              </View>
            </View>
            <View style={styles.detailsInfoRow}>
              <View style={styles.detailsInfoItem}>
                <Clock size={18} color="#6366F1" />
                <View style={styles.detailsInfoContent}>
                  <Text style={styles.detailsInfoLabel}>Min. Period</Text>
                  <Text style={styles.detailsInfoValue}>
                    {property.minimumRentalPeriod} months
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Utilities Information */}
          {(property.amenities?.utilitiesIncluded !== undefined || 
            property.amenities?.estimatedMonthlyUtilities || 
            property.amenities?.internetSpeed) && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Utilities & Internet</Text>
                <View style={styles.utilitiesContainer}>
                  <View style={styles.utilitiesItem}>
                    <DollarSign size={18} color="#6366F1" />
                    <Text style={styles.utilitiesText}>
                      Utilities: {property.amenities?.utilitiesIncluded 
                        ? "Included in rent" 
                        : property.amenities?.estimatedMonthlyUtilities 
                          ? `RM ${property.amenities.estimatedMonthlyUtilities}/month (estimated)`
                          : "Not included"}
                    </Text>
                  </View>
                  {property.amenities?.internetSpeed && (
                    <View style={styles.utilitiesItem}>
                      <Wifi size={18} color="#6366F1" />
                      <Text style={styles.utilitiesText}>
                        Internet: {property.amenities.internetSpeed}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </>
          )}

          <View style={styles.divider} />

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities & Facilities</Text>
            <View style={styles.amenitiesGrid}>
              {property.amenities.bedType && (
                <View style={styles.amenityItem}>
                  <Bed size={20} color="#6366F1" />
                  <Text style={styles.amenityText}>{property.amenities.bedType} Bed</Text>
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

          {/* House Rules */}
          {property.houseRules && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>House Rules</Text>
                <View style={styles.houseRulesContainer}>
                  {/* Cooking Policy */}
                  <View style={styles.houseRuleCard}>
                    <View style={styles.houseRuleIconContainer}>
                      <Utensils size={20} color="#6366F1" />
                    </View>
                    <View style={styles.houseRuleContent}>
                      <Text style={styles.houseRuleLabel}>Cooking Policy</Text>
                      <Text style={styles.houseRuleValue}>
                        {property.houseRules.cooking === "allowed" ? "Allowed" :
                        property.houseRules.cooking === "light_cooking" ? "Light Cooking Only" :
                        "No Cooking"}
                      </Text>
                    </View>
                  </View>

                  {/* Guests */}
                  <View style={[
                    styles.houseRuleCard,
                    property.houseRules.guestsAllowed ? styles.houseRuleCardAllowed : styles.houseRuleCardNotAllowed
                  ]}>
                    <View style={[
                      styles.houseRuleIconContainer,
                      property.houseRules.guestsAllowed ? styles.houseRuleIconContainerAllowed : styles.houseRuleIconContainerNotAllowed
                    ]}>
                      <Users size={20} color={property.houseRules.guestsAllowed ? "#10B981" : "#EF4444"} />
                    </View>
                    <View style={styles.houseRuleContent}>
                      <Text style={styles.houseRuleLabel}>Guests</Text>
                      <Text style={[
                        styles.houseRuleValue,
                        property.houseRules.guestsAllowed ? styles.houseRuleValueAllowed : styles.houseRuleValueNotAllowed
                      ]}>
                        {property.houseRules.guestsAllowed ? "Allowed" : "Not Allowed"}
                      </Text>
                    </View>
                  </View>

                  {/* Smoking */}
                  <View style={[
                    styles.houseRuleCard,
                    property.houseRules.smokingAllowed ? styles.houseRuleCardAllowed : styles.houseRuleCardNotAllowed
                  ]}>
                    <View style={[
                      styles.houseRuleIconContainer,
                      property.houseRules.smokingAllowed ? styles.houseRuleIconContainerAllowed : styles.houseRuleIconContainerNotAllowed
                    ]}>
                      <Ban size={20} color={property.houseRules.smokingAllowed ? "#10B981" : "#EF4444"} />
                    </View>
                    <View style={styles.houseRuleContent}>
                      <Text style={styles.houseRuleLabel}>Smoking</Text>
                      <Text style={[
                        styles.houseRuleValue,
                        property.houseRules.smokingAllowed ? styles.houseRuleValueAllowed : styles.houseRuleValueNotAllowed
                      ]}>
                        {property.houseRules.smokingAllowed ? "Allowed" : "Not Allowed"}
                      </Text>
                    </View>
                  </View>

                  {/* Pets */}
                  <View style={[
                    styles.houseRuleCard,
                    property.houseRules.petsAllowed ? styles.houseRuleCardAllowed : styles.houseRuleCardNotAllowed
                  ]}>
                    <View style={[
                      styles.houseRuleIconContainer,
                      property.houseRules.petsAllowed ? styles.houseRuleIconContainerAllowed : styles.houseRuleIconContainerNotAllowed
                    ]}>
                      <Dog size={20} color={property.houseRules.petsAllowed ? "#10B981" : "#EF4444"} />
                    </View>
                    <View style={styles.houseRuleContent}>
                      <Text style={styles.houseRuleLabel}>Pets</Text>
                      <Text style={[
                        styles.houseRuleValue,
                        property.houseRules.petsAllowed ? styles.houseRuleValueAllowed : styles.houseRuleValueNotAllowed
                      ]}>
                        {property.houseRules.petsAllowed ? "Allowed" : "Not Allowed"}
                      </Text>
                    </View>
                  </View>

                  {/* Quiet Hours */}
                  {property.houseRules.quietHours && (
                    <View style={styles.houseRuleCard}>
                      <View style={styles.houseRuleIconContainer}>
                        <Volume2 size={20} color="#6366F1" />
                      </View>
                      <View style={styles.houseRuleContent}>
                        <Text style={styles.houseRuleLabel}>Quiet Hours</Text>
                        <Text style={styles.houseRuleValue}>
                          {property.houseRules.quietHours}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Cleaning Rules */}
                  {property.houseRules.cleaningRules && (
                    <View style={[styles.houseRuleCard, styles.houseRuleCardMultiline]}>
                      <View style={[styles.houseRuleIconContainer, styles.houseRuleIconContainerMultiline]}>
                        <Sparkles size={20} color="#6366F1" />
                      </View>
                      <View style={styles.houseRuleContent}>
                        <Text style={styles.houseRuleLabel}>Cleaning Rules</Text>
                        <Text style={[styles.houseRuleValue, { lineHeight: 20 }]}>
                          {property.houseRules.cleaningRules}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </>
          )}

          <View style={styles.divider} />

          {/* Nearby Places */}
          <NearbyPlaces
            markerPosition={{ lat: property.latitude, lng: property.longitude }}
            radius={1000}
            categories={["transport","food","shopping","facility","environment","education"]}
            apiKey={GOOGLE_MAPS_API_KEY}
            onResults={(places:NearbyPlace[], counts: NearbyCounts) => {
              const normalized: NearbyPlace[] = places.map(p => ({
                id: p.id,
                name: p.name,
                lat: p.lat,   // map lat -> latitude
                lng: p.lng,  // map lng ->  longitude
                distance: p.distance,
                category: p.category || "other",
              }));

              setNearbyResults(normalized);
              setNearbyCounts(counts);
            }}
          />

          Show Nearby Places with difference category color 
          <MapView
            style={styles.mapView}
            initialRegion={{
              latitude: property.latitude,
              longitude: property.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >

          {/* Property location */}
          <Marker
            coordinate={{ latitude: property.latitude, longitude: property.longitude }}
            title={property.title}
            description="Property Location"
            pinColor="#6366F1" 
          />

            {/* Nearby places */}
            {nearbyResults.map((place) => (
              <Marker
                key={place.id}
                coordinate={{ latitude: place.lat, longitude: place.lng }}
                title={place.name}
                description={place.category.toUpperCase()}
                pinColor={CATEGORY_COLORS[place.category]} // color by category
              />
            ))}
          </MapView>

          {/* Nearby Counts */}
          <View style={styles.nearbyCountsContainer}>
            {nearbyCounts &&
              Object.entries(nearbyCounts).map(([type, count]) => (
                <View key={type} style={styles.nearbyCountCard}>
                  <Text style={styles.nearbyCountType}>
                    {type.toUpperCase()}
                  </Text>
                  <Text style={styles.nearbyCountValue}>
                    {count}
                  </Text>
                </View>
              ))}
          </View>
        
          {/* Worthiness Card */}
          <View style={styles.worthinessCard}>
            <Text style={styles.worthinessTitle}>House Worthiness</Text>
            <Text style={styles.worthinessScore}>
              {totalScore.toFixed(1)} / 100
            </Text>

            {categoryScores && (
              <View style={styles.worthinessCategoryContainer}>
                {Object.entries(categoryScores).map(([category, score]) => (
                  <View key={category} style={styles.worthinessCategoryItem}>
                    <Text style={styles.worthinessCategoryLabel}>
                      {category}: {score.toFixed(1)}
                    </Text>
                    <View style={styles.worthinessProgressBar}>
                      <View style={[styles.worthinessProgressFill, { width: `${score}%` }]} />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>

          {/* Landlord Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Landlord</Text>
            <View style={styles.landlordContainer}>
              {property.landlordPhoto ? (
                <Image
                  source={{ uri: property.landlordPhoto }}
                  style={{ width: 50, height: 50, borderRadius: 25 }}
                />
              ) : (
                <View style={styles.landlordPhotoPlaceholder}>
                  <Text style={styles.landlordPhotoPlaceholderText}>
                    {property.landlordName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.landlordInfoContainer}>
                <View style={styles.landlordNameRow}>
                  <Text style={styles.landlordName}>{property.landlordName}</Text>
                  {property.landlordVerified && (
                    <Shield size={16} color="#10B981" fill="#10B981" />
                  )}
                </View>
                <Text style={styles.landlordStatus}>
                  {property.landlordVerified ? "Verified Landlord" : "Unverified"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.contentSpacer} />

          {/* Reviews Summary */}
          {property.totalReviews > 0 && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Text style={{ fontSize: 32, fontWeight: "700", color: "#1F2937" }}>
                    {property.averageRating.toFixed(1)}
                  </Text>
                  <View>
                    <Text style={{ fontSize: 14, color: "#6B7280" }}>
                      {property.totalReviews} {property.totalReviews === 1 ? "review" : "reviews"}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 2, marginTop: 4 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Text key={star} style={{ fontSize: 16 }}>
                          {star <= Math.round(property.averageRating) ? "⭐" : "☆"}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.divider} />
            </>
          )}
          
          <View style={styles.divider} />

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable style={styles.contactButton} onPress={handleContactLandlord}>
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