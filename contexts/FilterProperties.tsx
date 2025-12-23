import { supabase } from "@/lib/supabase";
import { normalizeProperty } from "api/normalizeProperty";
import type { Property } from "@/types/property";
import type { Filters } from "@/components/tenant/PropertyFiltersModal";

export async function fetchFilteredProperties(
  searchQuery: string,
  filters: Filters
): Promise<Property[]> {
  let query = supabase.from("Property").select("*");

  if (searchQuery) {
    query = query.or(
      `address.ilike.%${searchQuery}%`
    );
  }

  if (filters.location)
    query = query.ilike("address", `%${filters.location}%`);

  if (filters.propertyTypes.length > 0)
    query = query.in("property_type", filters.propertyTypes);

  if (filters.priceMin)
    query = query.gte("monthly_rent", Number(filters.priceMin));

  if (filters.priceMax)
    query = query.lte("monthly_rent", Number(filters.priceMax));

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []).map(normalizeProperty);
}
