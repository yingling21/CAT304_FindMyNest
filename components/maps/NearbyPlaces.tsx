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
   Google Places type mapping
------------------------------------ */

const CATEGORY_MAP: Record<PlaceCategory, string[]> = {
  transport: ["bus_station", "subway_station", "train_station"],
  food: ["restaurant", "cafe", "bakery"],
  shopping: ["shopping_mall", "supermarket"],
  facility: ["hospital", "pharmacy", "police"],
  environment: ["park"],
  education: ["school", "university"],
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
    async function fetchPlaces() {
      const allPlaces: NearbyPlace[] = [];
      const counts: NearbyCounts = {
        transport: 0,food: 0,shopping: 0,facility: 0,environment: 0,education: 0,};

      for (const category of categories) {
        const types = CATEGORY_MAP[category];

        for (const type of types) {
          const url =
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
            `?location=${markerPosition.lat},${markerPosition.lng}` +
            `&radius=${radius}` +
            `&type=${type}` +
            `&key=${apiKey}`;

          try {
            const res = await fetch(url);
            const json = await res.json();

            if (!json.results) continue;

            json.results.forEach((p: any) => {
              const distance = getDistance(
                markerPosition.lat,markerPosition.lng,
                p.geometry.location.lat,p.geometry.location.lng
              );

              allPlaces.push({
                id: p.place_id,
                name: p.name,
                lat: p.geometry.location.lat,
                lng: p.geometry.location.lng,
                category,
                distance,
              });
            });
            counts[category] += json.results.length;
          } catch (err) {
            console.error("NearbyPlaces error:", err);
          }
        }
      }
      onResults(allPlaces, counts);
    }
    fetchPlaces();
  }, [markerPosition.lat, markerPosition.lng, radius, categories, apiKey]);

  return null; // logic-only component
}
