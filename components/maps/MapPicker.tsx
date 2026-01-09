import React, { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, StyleSheet, Text, Pressable, Alert } from "react-native";
import MapView, { Marker, MapPressEvent, Region, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { MapPin, Navigation } from "lucide-react-native";

interface MapPickerProps {
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  setRegion?: React.Dispatch<
    React.SetStateAction<{
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    } | undefined>
  >;
  onLocationSelect: (data: { latitude: number; longitude: number; address: string }) => void;
}

export default function MapPicker({ region, setRegion, onLocationSelect }: MapPickerProps) {
  const [internalRegion, setInternalRegion] = useState<Region | undefined>(region);
  const [loading, setLoading] = useState(!region);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!region) {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          const fallbackRegion = {
            latitude: 3.1390,
            longitude: 101.6869,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setInternalRegion(fallbackRegion);
          setRegion?.(fallbackRegion);
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const initialRegion = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setInternalRegion(initialRegion);
        setRegion?.(initialRegion);
        setLoading(false);
        
        // Get initial address
        try {
          const geo = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          if (geo[0]) {
            const address = formatAddress(geo[0]);
            onLocationSelect({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              address,
            });
          }
        } catch (err) {
          console.warn("Failed to reverse geocode:", err);
        }
      })();
    } else {
      setInternalRegion(region);
      setLoading(false);
    }
  }, [region]);

  const formatAddress = (geo: Location.LocationGeocodedAddress): string => {
    const parts = [];
    if (geo.name) parts.push(geo.name);
    if (geo.street) parts.push(geo.street);
    if (geo.district) parts.push(geo.district);
    if (geo.city) parts.push(geo.city);
    if (geo.region) parts.push(geo.region);
    if (geo.postalCode) parts.push(geo.postalCode);
    return parts.filter(Boolean).join(", ") || "Selected location";
  };

  const handlePress = async (event: MapPressEvent) => {
    if (!internalRegion) return;
    const { latitude, longitude } = event.nativeEvent.coordinate;

    try {
      // Reverse geocode to get address
      const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
      const address = geo[0] ? formatAddress(geo[0]) : "Selected location";

      const newRegion = {
        ...internalRegion,
        latitude,
        longitude,
      };
      
      setInternalRegion(newRegion);
      setRegion?.(newRegion);
      onLocationSelect({ latitude, longitude, address });
    } catch (err) {
      console.warn("Failed to reverse geocode:", err);
      onLocationSelect({ latitude, longitude, address: "Selected location" });
    }
  };

  const handleRegionChangeComplete = async (newRegion: Region) => {
    if (!internalRegion) return;
    
    // Only update if the center changed significantly (user dragged the map)
    const latDiff = Math.abs(newRegion.latitude - internalRegion.latitude);
    const lngDiff = Math.abs(newRegion.longitude - internalRegion.longitude);
    
    if (latDiff > 0.0001 || lngDiff > 0.0001) {
      try {
        const geo = await Location.reverseGeocodeAsync({
          latitude: newRegion.latitude,
          longitude: newRegion.longitude,
        });
        const address = geo[0] ? formatAddress(geo[0]) : "Selected location";
        
        setInternalRegion(newRegion);
        setRegion?.(newRegion);
        onLocationSelect({
          latitude: newRegion.latitude,
          longitude: newRegion.longitude,
          address,
        });
      } catch (err) {
        console.warn("Failed to reverse geocode:", err);
      }
    }
  };

  const centerToCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required to use this feature.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setInternalRegion(newRegion);
      setRegion?.(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
      
      // Get address for current location
      try {
        const geo = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        const address = geo[0] ? formatAddress(geo[0]) : "Current location";
        onLocationSelect({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          address,
        });
      } catch (err) {
        console.warn("Failed to reverse geocode:", err);
      }
    } catch (err) {
      console.warn("Failed to get current location:", err);
    }
  };

  if (loading || !internalRegion) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={internalRegion}
        onPress={handlePress}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
        mapType="standard"
      >
        <Marker
          coordinate={{
            latitude: internalRegion.latitude,
            longitude: internalRegion.longitude,
          }}
          title="Selected Location"
        />
      </MapView>
      
      {/* Center crosshair indicator */}
      <View style={styles.crosshair} pointerEvents="none">
        <MapPin size={32} color="#6366F1" />
      </View>

      {/* Current location button */}
      <Pressable style={styles.currentLocationButton} onPress={centerToCurrentLocation}>
        <Navigation size={20} color="#6366F1" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },
  map: {
    flex: 1,
  },
  crosshair: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -16,
    marginLeft: -16,
    zIndex: 1,
  },
  currentLocationButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "#FFFFFF",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 2,
  },
});
