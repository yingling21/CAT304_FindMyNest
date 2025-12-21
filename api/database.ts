import { supabase } from "@/lib/supabase";
import type { Property } from "@/types/property";
import { normalizeProperty } from "./normalizeProperty";

export async function getAvailableProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("rental_status", "available");

  if (error) {
    throw new Error(error.message);
  }

  return data.map(normalizeProperty);
}