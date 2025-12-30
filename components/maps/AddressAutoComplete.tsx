import { useEffect, useRef } from "react";

interface AddressAutocompleteProps {
  onSelectAddress: (data: {
    lat: number;
    lng: number;
    address: string;
  }) => void;
}

function AddressAutocomplete({ onSelectAddress }: AddressAutocompleteProps) {
  // Type the ref properly
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    if (!window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        fields: ["geometry", "formatted_address"],
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      // Safe guards for TypeScript
      if (!place.geometry || !place.geometry.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || "";

      onSelectAddress({ lat, lng, address });
    });
  }, [onSelectAddress]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Enter house address"
      className="w-full p-2 border rounded"
    />
  );
}

export default AddressAutocomplete;
