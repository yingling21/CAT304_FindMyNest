import React from "react";
import MapView, { Marker } from "react-native-maps";
import { PlaceCategory } from "@/src/types/nearby";

export interface ExtraMarker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  category: PlaceCategory;
}

interface MapComponentProps {
  initialPosition: { lat: number; lng: number };
  extraMarkers?: ExtraMarker[];
}

/* -----------------------------------
   Component
------------------------------------ */

export default function MapComponent({
  initialPosition,
  extraMarkers = [],
}: MapComponentProps) {
  return (
    <MapView
      style={{ width: "100%", height: 250 }}
      initialRegion={{
        latitude: initialPosition.lat,
        longitude: initialPosition.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      {/* Property marker */}
      <Marker
        coordinate={{
          latitude: initialPosition.lat,
          longitude: initialPosition.lng,
        }}
        title="Property Location"
        pinColor="blue"
      />

      {/* Nearby places */}
      {extraMarkers.map((m, index) => (
        <Marker
          key={`${m.id}-${m.category}-${index}`}
          coordinate={{ latitude: m.lat, longitude: m.lng }}
          title={m.title || "Nearby Place"}
        />
      ))}
    </MapView>
  );
}