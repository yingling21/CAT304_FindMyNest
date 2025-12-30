import React, { useState, useEffect } from "react";
import { ScrollView, Text, View, Pressable, Alert, Button } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapComponent, { ExtraMarker } from "@/components/maps/MapComponent";
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
} from "lucide-react-native";
import { calculateWorthiness, type WorthinessResult } 
  from "@/src/utils/worthinessCalculator";
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
  const [nearbyResults, setNearbyResults] = useState<NearbyPlace[]>([]);
  const [nearbyCounts, setNearbyCounts] = useState<NearbyCounts | null>({
    transport: 0,
    food: 0,
    shopping: 0,
    facility: 0,
    environment: 0,
    education: 0,
  });
  // const CATEGORY_COLORS: Record<string, string> = {
  //   transport: "#6366F1",  // blue
  //   food: "#F59E0B",       // yellow
  //   shopping: "#10B981",   // green
  //   facility: "#EF4444",   // red
  //   environment: "#22D3EE", // teal
  //   education: "#A78BFA",   // purple
  //   other: "#9CA3AF",       // gray
  // };

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
          <Image
            source={{ uri: property.photos[currentPhotoIndex]?.url || "https://via.placeholder.com/400" }}
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

        {/* Content */}
        <View style={styles.content}>
          {/* Title & Address */}
          <View style={styles.titleSection}>
            <View style={styles.badges}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                </Text>
              </View>
              {property.rentalStatus && (
                <View style={styles.availableBadge}>
                  <Text style={styles.availableBadgeText}>Available Now</Text>
                </View>
              )}
            </View>
            <Text style={styles.title}>
              {`${property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)} at ${property.address.split(',')[0]}`}
            </Text>
            <View style={styles.locationRow}>
              <MapPin size={18} color="#6B7280" />
              <Text style={styles.address}>{property.address}</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>RM {property.monthlyRent}</Text>
              <Text style={styles.priceLabel}>/month</Text>
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
              <View style={styles.detailItem}>
                <Armchair size={20} color="#6366F1" />
                <Text style={styles.detailLabel}>Furnishing</Text>
                <Text style={styles.detailValue}>{formatFurnishing(property.furnishingLevel)}</Text>
              </View>
            </View>
          </View>

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

          <MapComponent
            initialPosition={{ lat: property.latitude, lng: property.longitude }}
            extraMarkers={nearbyResults
              .filter(p => ["transport","food","shopping","facility","environment","education"].includes(p.category))
              .map(p => ({
                id: p.id,
                name: p.name,
                lat: p.lat,
                lng: p.lng,
                category: p.category as PlaceCategory, // assert type
              }))
            }
          />

            {/* Show Nearby Places with difference category color  */}
          {/* <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: property.latitude,
              longitude: property.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            {/* Property location */}
            {/* <Marker
              coordinate={{ latitude: property.latitude, longitude: property.longitude }}
              title={property.title}
              description="Property Location"
              pinColor="#6366F1" // main property color
            />

            {/* Nearby places */}
            {/* {nearbyResults.map((place) => (
              <Marker
                key={place.id}
                coordinate={{ latitude: place.lat, longitude: place.lng }}
                title={place.name}
                description={place.category.toUpperCase()}
                pinColor={CATEGORY_COLORS[place.category]} // color by category
              />
            ))}
          </MapView> */}

          {/* Nearby Counts */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            {nearbyCounts &&
              Object.entries(nearbyCounts).map(([type, count]) => (
                <View
                  key={type}
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 16,
                    backgroundColor: "#EEF2FF",
                    borderWidth: 1,
                    borderColor: "#C7D2FE",
                    minWidth: 60,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: "600", color: "#3730A3", marginBottom: 2 }}>
                    {type.toUpperCase()}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E40AF" }}>
                    {count}
                  </Text>
                </View>
              ))}
          </View>
          
          <View style={styles.divider} />

          {/* Worthiness Card */}
          <View style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
            marginBottom: 24,
          }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
              House Worthiness
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#4caf50" }}>
              {totalScore.toFixed(1)} / 100
            </Text>

          {/* Category Scores */}
          {categoryScores && (
            <View style={{ marginTop: 16 }}>
              {Object.entries(categoryScores).map(([category, score]) => (
                <View key={category} style={{ marginBottom: 12 }}>
                  <Text style={{ textTransform: "capitalize", fontWeight: "600", marginBottom: 4 }}>
                    {category}: {score.toFixed(1)}
                  </Text>
                  <View style={{
                    height: 8,
                    backgroundColor: "#eee",
                    borderRadius: 4,
                    overflow: "hidden"
                  }}>
                    <View style={{
                      width: `${score}%`,
                      height: "100%",
                      backgroundColor: "#6366F1", // same color as footer buttons
                      borderRadius: 4,
                    }} />
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

          {/* You can continue adding Reviews and Landlord info here as before */}

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