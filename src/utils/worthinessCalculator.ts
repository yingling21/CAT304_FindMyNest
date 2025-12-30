import { NearbyPlace, PlaceCategory } from "@/src/types/nearby";

/* -----------------------------------
   Configuration
------------------------------------ */

export const CATEGORY_WEIGHTS: Record<PlaceCategory, number> = {
  transport: 25,
  food: 15,
  shopping: 15,
  facility: 20,
  education: 15,
  environment: 10,
};

const MAX_PLACES_PER_CATEGORY = 10;

/* -----------------------------------
   Distance → Score
------------------------------------ */

function proximityScore(distance: number): number {
  if (distance <= 300) return 1.0;
  if (distance <= 600) return 0.8;
  if (distance <= 1000) return 0.6;
  if (distance <= 1500) return 0.4;
  return 0.2;
}

/* -----------------------------------
   Output type
------------------------------------ */

export interface WorthinessResult {
  totalScore: number; // 0 – 100
  categoryScores: Record<PlaceCategory, number>; // 0 – 100 per category
}

/* -----------------------------------
   Calculator
------------------------------------ */

export function calculateWorthiness(
  places: NearbyPlace[]
): WorthinessResult {
  const categoryScores: Record<PlaceCategory, number> = {
    transport: 0,
    food: 0,
    shopping: 0,
    facility: 0,
    education: 0,
    environment: 0,
  };

  let totalScore = 0;

  for (const category in CATEGORY_WEIGHTS) {
    const weight = CATEGORY_WEIGHTS[category as PlaceCategory];

    // Pick top nearby places
    const categoryPlaces = places
      .filter(p => p.category === category)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, MAX_PLACES_PER_CATEGORY);

    if (categoryPlaces.length === 0) {
      categoryScores[category as PlaceCategory] = 0;
      continue;
    }

    // Average proximity (0–1)
    const avgProximity =
      categoryPlaces.reduce(
        (sum, p) => sum + proximityScore(p.distance),
        0
      ) / categoryPlaces.length;

    // Scale each category to 0–100
    const categoryScore = avgProximity * 100;
    categoryScores[category as PlaceCategory] =
      Number(categoryScore.toFixed(1));

    // Weighted contribution to total score
    totalScore += (categoryScore * weight) / 100;
  }

  return {
    totalScore: Number(totalScore.toFixed(1)),
    categoryScores,
  };
}
