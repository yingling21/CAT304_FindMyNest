import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Platform } from "react-native";
import MapView, { Marker, MapPressEvent, Region, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

interface ExtraMarker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
}

interface MapComponentProps {
  initialPosition?: { lat: number; lng: number };
  onSelectLocation?: (position: { lat: number; lng: number }) => void;
  zoom?: number;
  extraMarkers?: ExtraMarker[];
}

const defaultCenter = { lat: 3.1390, lng: 101.6869 };

const MapComponent: React.FC<MapComponentProps> = ({
  initialPosition,
  onSelectLocation,
  zoom = 15,
  extraMarkers = [],
}) => {
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);

  const zoomToDelta = (zoomLevel: number) => 0.01 * Math.pow(2, 15 - zoomLevel);

  useEffect(() => {
    (async () => {
      if (initialPosition) {
        setRegion({
          latitude: initialPosition.lat,
          longitude: initialPosition.lng,
          latitudeDelta: zoomToDelta(zoom),
          longitudeDelta: zoomToDelta(zoom),
        });
        setLoading(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setRegion({
          latitude: defaultCenter.lat,
          longitude: defaultCenter.lng,
          latitudeDelta: zoomToDelta(zoom),
          longitudeDelta: zoomToDelta(zoom),
        });
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: zoomToDelta(zoom),
        longitudeDelta: zoomToDelta(zoom),
      });
      setLoading(false);
    })();
  }, [initialPosition, zoom]);

  const handlePress = (event: MapPressEvent) => {
    if (!region) return;
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newRegion = { ...region, latitude, longitude };
    setRegion(newRegion);
    onSelectLocation?.({ lat: latitude, lng: longitude });
  };

  if (loading || !region) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <MapView
      style={styles.map}
      provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined} // Google Maps for Android, Apple Maps for iOS
      region={region}
      onPress={handlePress}
      showsUserLocation
      showsMyLocationButton
    >
      {/* Main property marker */}
      <Marker
        coordinate={{ latitude: region.latitude, longitude: region.longitude }}
        title="Property"
        pinColor="red"
      />

      {/* Nearby places markers */}
      {extraMarkers.map((m) => (
        <Marker
          key={m.id}
          coordinate={{ latitude: m.lat, longitude: m.lng }}
          title={m.title || "Nearby Place"}
          pinColor="green"
        />
      ))}
    </MapView>
  );
};

export default MapComponent;

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
