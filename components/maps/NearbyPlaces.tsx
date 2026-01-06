import { useEffect } from "react";
import { NearbyPlace, NearbyCounts, PlaceCategory } from "@/src/types/nearby";

interface NearbyPlacesProps {
  markerPosition: { lat: number; lng: number };
  radius: number;
  categories: PlaceCategory[];
  apiKey: string;
  onResults: (places: NearbyPlace[], counts: NearbyCounts) => void;
}

/* -----------------------------------
   Google Places type mapping (New API format)
------------------------------------ */

const CATEGORY_MAP: Record<PlaceCategory, string[]> = {
  transport: ["bus_station", "subway_station", "train_station"],
  food: ["restaurant", "cafe", "bakery"],
  shopping: ["shopping_mall", "supermarket"],
  facility: ["hospital", "pharmacy", "police"],
  environment: ["park"],
  education: ["school", "university"],
};

// Map to new API type format
const TYPE_TO_NEW_API_TYPE: Record<string, string> = {
  bus_station: "bus_station",
  subway_station: "subway_station",
  train_station: "train_station",
  restaurant: "restaurant",
  cafe: "cafe",
  bakery: "bakery",
  shopping_mall: "shopping_mall",
  supermarket: "supermarket",
  hospital: "hospital",
  pharmacy: "pharmacy",
  police: "police",
  park: "park",
  school: "school",
  university: "university",
};

/* -----------------------------------
   Helper: Haversine formula
------------------------------------ */

function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
}

/* -----------------------------------
   Component
------------------------------------ */

export default function NearbyPlaces({
  markerPosition,radius,categories,apiKey,onResults,}: NearbyPlacesProps) {
  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    async function fetchPlaces() {
      // Check if API key is available
      if (!apiKey) {
        console.error("Google Maps API key is missing!");
        onResults([], {
          transport: 0,
          food: 0,
          shopping: 0,
          facility: 0,
          environment: 0,
          education: 0,
        });
        return;
      }

      // Check if coordinates are valid
      if (!markerPosition.lat || !markerPosition.lng) {
        console.error("Invalid marker position:", markerPosition);
        onResults([], {
          transport: 0,
          food: 0,
          shopping: 0,
          facility: 0,
          environment: 0,
          education: 0,
        });
        return;
      }

      // Removed excessive logging - only log if needed for debugging
      
      const allPlaces: NearbyPlace[] = [];
      const counts: NearbyCounts = {
        transport: 0,
        food: 0,
        shopping: 0,
        facility: 0,
        environment: 0,
        education: 0,
      };

      let apiErrorLogged = false; // Track if we've already logged the API error

      // OPTIMIZATION: Combine all types per category into single API calls
      // This reduces API calls from ~14 to 6 (one per category) - saves ~57% quota!
      for (const category of categories) {
        const types = CATEGORY_MAP[category];
        
        // Convert all types in this category to new API format
        const newApiTypes = types.map(type => TYPE_TO_NEW_API_TYPE[type] || type);
        
        try {
          // Add delay between API calls to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 200));
          
          if (!isMounted) return;
          
          // Use new Places API (New) - request ALL types in category at once
          const url = `https://places.googleapis.com/v1/places:searchNearby`;
          
          const requestBody = {
            includedTypes: newApiTypes, // Send all types for this category in one request
            maxResultCount: 10, // Reduced from 20 to save quota (still plenty of results)
              locationRestriction: {
                circle: {
                  center: {
                    latitude: markerPosition.lat,
                    longitude: markerPosition.lng,
                  },
                  radius: radius,
                },
              },
            };

            const res = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "places.id,places.displayName,places.location,places.types",
              },
              body: JSON.stringify(requestBody),
            });

            const json = await res.json();

            // Check for API errors
            if (!res.ok || json.error) {
              // Only log the error once to reduce console noise
              if (!apiErrorLogged) {
                const errorMsg = json.error?.message || json.message || res.statusText;
                const errorCode = json.error?.code || json.code;
                
                if (errorCode === 429 || errorMsg?.includes("RATE_LIMIT_EXCEEDED") || errorMsg?.includes("Quota exceeded")) {
                  console.warn("⚠️ Rate limit exceeded. Please wait a moment before trying again.");
                  // Stop making more API calls if rate limited
                  break;
                } else if (errorMsg?.includes("SERVICE_DISABLED") || errorMsg?.includes("not been used") || errorMsg?.includes("disabled")) {
                  console.warn("⚠️ Places API (New) is not enabled. Please enable it in Google Cloud Console:", 
                    "https://console.developers.google.com/apis/api/places.googleapis.com/overview");
                } else {
                  console.error("Google Places API (New) error:", json.error || res.statusText);
                }
                apiErrorLogged = true;
              }
              continue;
            }

            if (!json.places || json.places.length === 0) {
              continue;
            }

            json.places.forEach((p: any) => {
              const lat = p.location?.latitude || p.geometry?.location?.lat;
              const lng = p.location?.longitude || p.geometry?.location?.lng;
              
              if (!lat || !lng) {
                console.warn("Place missing coordinates:", p);
                return;
              }

              const distance = getDistance(
                markerPosition.lat,
                markerPosition.lng,
                lat,
                lng
              );

              allPlaces.push({
                id: p.id || p.place_id || `${category}-${lat}-${lng}`,
                name: p.displayName?.text || p.name || "Unknown Place",
                lat,
                lng,
                category,
                distance,
              });
            });
            counts[category] += json.places.length;
          } catch (err) {
            console.error(`NearbyPlaces error for ${category}:`, err);
          }
      }
      
      // Deduplicate places by ID (same place can appear in multiple categories)
      const uniquePlacesMap = new Map<string, NearbyPlace>();
      allPlaces.forEach(place => {
        const existing = uniquePlacesMap.get(place.id);
        if (!existing || place.distance < existing.distance) {
          // Keep the one with the closest distance
          uniquePlacesMap.set(place.id, place);
        }
      });
      const uniquePlaces = Array.from(uniquePlacesMap.values());
      
      if (!isMounted) return;
      
      onResults(uniquePlaces, counts);
    }
    
    // Debounce the API calls to prevent rate limiting
    timeoutId = setTimeout(() => {
      fetchPlaces();
    }, 500);
    
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [markerPosition.lat, markerPosition.lng, radius, categories, apiKey, onResults]);

  return null; // logic-only component
}
