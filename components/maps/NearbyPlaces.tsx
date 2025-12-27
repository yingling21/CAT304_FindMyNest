import { useEffect } from "react";

interface NearbyPlacesProps {
  map: google.maps.Map | null;
  markerPosition: { lat: number; lng: number };
  onResults?: (places: google.maps.places.PlaceResult[]) => void;
}

const NearbyPlaces: React.FC<NearbyPlacesProps> = ({ map, markerPosition, onResults }) => {
  useEffect(() => {
    if (!map || !markerPosition) return;

    const service = new google.maps.places.PlacesService(map);

    // Use string[] instead of google.maps.PlaceType
    const types: string[] = ["restaurant", "shopping_mall", "bus_station"];

    let allResults: google.maps.places.PlaceResult[] = [];

    types.forEach((type) => {
      const request: google.maps.places.PlaceSearchRequest = {
        location: markerPosition,
        radius: 1000,
        type: type, // single string
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          allResults = [...allResults, ...results];
          if (onResults) onResults(allResults); // send results back to parent
        }
      });
    });
  }, [map, markerPosition, onResults]);

  return null; // This component does not render anything itself
};

export default NearbyPlaces;
