export type PlaceCategory =
  | "transport"
  | "food"
  | "shopping"
  | "facility"
  | "environment"
  | "education";

export interface NearbyPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: PlaceCategory;
  distance: number;
}

export type NearbyCounts = Record<PlaceCategory, number>;
