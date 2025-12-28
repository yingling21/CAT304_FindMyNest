import { useEffect } from "react";

interface NearbyPlacesProps {
  markerPosition: { lat: number; lng: number };
  radius?: number; // meters
  types?: string[]; // e.g., ["restaurant", "shopping_mall"]
  apiKey: string; // Google Places API key
  onResults?: (places: any[], counts: Record<string, number>) => void;
}

const NearbyPlaces: React.FC<NearbyPlacesProps> = ({
  markerPosition,
  radius = 1000,
  types = ["restaurant", "shopping_mall", "bus_station"],
  apiKey,
  onResults,
}) => {
  useEffect(() => {
    if (!markerPosition || !apiKey) return;

    const fetchNearbyPlaces = async () => {
      try {
        // fetch all types in parallel
        const results = await Promise.all(
          types.map(async (type) => {
            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${markerPosition.lat},${markerPosition.lng}&radius=${radius}&type=${type}&key=${apiKey}`;
            const res = await fetch(url);
            const json = await res.json();

            if (json.status === "OK" && json.results) {
              return json.results.map((place: any) => ({
                id: place.place_id,
                name: place.name,
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
                type: type,
              }));
            } else {
              console.warn(`NearbyPlaces API error for type "${type}": ${json.status}`);
              return [];
            }
          })
        );

        // flatten all results into a single array
        const allResults = results.flat();

        // compute counts per type
        const counts = allResults.reduce((acc: Record<string, number>, place) => {
          acc[place.type] = (acc[place.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        if (onResults) onResults(allResults, counts);
      } catch (err) {
        console.error("NearbyPlaces fetch error:", err);
      }
    };

    fetchNearbyPlaces();
  }, [markerPosition, types, radius, apiKey, onResults]);

  return null; // This component does not render anything
};

export default NearbyPlaces;
