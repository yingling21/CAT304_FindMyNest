import { supabase } from "@/lib/supabase";
import type { Property } from "@/types/property";
import { normalizeProperty } from "./normalizeProperty";

export async function getAvailableProperties(): Promise<Property[]> {
const { data, error } = await supabase
  .from("property")
  .select(`
    *,
    landlord:landlord_id (
      id,
      full_name,
      avatar_url,
      verified
    ),
    property_Photo (
      photo_id,
      photo_url,
      is_cover
    )
  `)
  .eq("rental_status", "available");

  if (error) {
    throw new Error(error.message);
  }

  return data.map(normalizeProperty);
}