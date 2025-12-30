import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Platform, StyleSheet } from "react-native";
import MapView, { Marker, MapPressEvent, Region, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

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
      })();
    } else {
      setInternalRegion(region);
      setLoading(false);
    }
  }, [region]);

  const handlePress = async (event: MapPressEvent) => {
    if (!internalRegion) return;
    const { latitude, longitude } = event.nativeEvent.coordinate;

    // Reverse geocode to get address
    const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
    const address =
      geo[0]
        ? `${geo[0].name ?? ""} ${geo[0].street ?? ""}, ${geo[0].city ?? ""}`
        : "Selected location";

    setInternalRegion({ ...internalRegion, latitude, longitude });
    setRegion?.({ ...internalRegion, latitude, longitude });
    onLocationSelect({ latitude, longitude, address });
  };

  if (loading || !internalRegion) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined} // Google Maps on Android
        region={internalRegion}
        onPress={handlePress}
        showsUserLocation
        showsMyLocationButton
      >
        <Marker coordinate={internalRegion} title="Selected Location" />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 300,
  },
  map: {
    flex: 1,
  },
});
