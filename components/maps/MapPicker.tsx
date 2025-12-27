import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import MapView, { Marker, MapPressEvent, Region } from "react-native-maps";
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
  const [internalRegion, setInternalRegion] = useState(region);
  const [loading, setLoading] = useState(!region);

  useEffect(() => {
    if (!region) {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

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
    if (!setRegion) return;
    const { latitude, longitude } = event.nativeEvent.coordinate;

    const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
    const address =
      geo[0]
        ? `${geo[0].name ?? ""} ${geo[0].street ?? ""}, ${geo[0].city ?? ""}`
        : "Selected location";

    onLocationSelect({ latitude, longitude, address });
    setInternalRegion({ ...internalRegion!, latitude, longitude });
    setRegion({ ...internalRegion!, latitude, longitude });
  };

  if (loading || !internalRegion) return <ActivityIndicator />;

  return (
    <MapView style={{ height: 300 }} region={internalRegion} onPress={handlePress}>
      <Marker coordinate={internalRegion} />
    </MapView>
  );
}
