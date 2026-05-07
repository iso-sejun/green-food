const RECIPE_CARBON_CLASS_SCORES: Record<string, number> = {
  "A+": 100,
  A: 92,
  B: 82,
  C: 70,
  D: 55,
  E: 40,
  F: 22,
  G: 8
};

export function getRecipeCarbonScore(carbonClass: string | null): number | null {
  if (!carbonClass) {
    return null;
  }

  return RECIPE_CARBON_CLASS_SCORES[carbonClass] ?? null;
}

export function getTripEmissionScore(tripCarbonKg: number | null): number | null {
  if (tripCarbonKg === null || Number.isNaN(tripCarbonKg)) {
    return null;
  }

  if (tripCarbonKg <= 0.5) {
    return 98;
  }

  if (tripCarbonKg <= 1.0) {
    return 88;
  }

  if (tripCarbonKg <= 2.0) {
    return 72;
  }

  if (tripCarbonKg <= 3.0) {
    return 58;
  }

  if (tripCarbonKg <= 4.0) {
    return 42;
  }

  if (tripCarbonKg <= 5.0) {
    return 26;
  }

  return 12;
}

export function getOverallImpactScore(
  recipeScore: number | null,
  tripScore: number | null
): number | null {
  if (recipeScore === null || tripScore === null) {
    return null;
  }

  return Math.round(recipeScore * 0.7 + tripScore * 0.3);
}

export function getOverallImpactLabel(score: number | null): string | null {
  if (score === null) {
    return null;
  }

  if (score >= 85) {
    return "Low overall impact";
  }

  if (score >= 70) {
    return "Lower overall impact";
  }

  if (score >= 55) {
    return "Moderate overall impact";
  }

  if (score >= 40) {
    return "Higher overall impact";
  }

  return "High overall impact";
}
