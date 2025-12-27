import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useState } from "react";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 3.1390,
  lng: 101.6869,
};

interface MapComponentProps {
  initialPosition?: { lat: number; lng: number };
  onSelectLocation?: (position: { lat: number; lng: number }) => void;
}

function MapComponent({ initialPosition, onSelectLocation }: MapComponentProps) {
  const [markerPosition, setMarkerPosition] = useState(initialPosition || defaultCenter);

  // Use google.maps.MapMouseEvent from global types
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPosition({ lat, lng });
    if (onSelectLocation) onSelectLocation({ lat, lng });
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API key is missing");
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={["places"]}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition}
        zoom={15}
        onClick={handleMapClick}
      >
        <Marker position={markerPosition} />
      </GoogleMap>
    </LoadScript>
  );
}

export default MapComponent;
