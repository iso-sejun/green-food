"use client";

import { RecipeIngredient, Recipe } from "./types";

const KEYS = {
  checklist: "green-table:ingredient-checklists",
  location: "green-table:location",
  savedRecipes: "green-table:saved-recipes",
  storeResults: "green-table:store-results",
  impactReports: "green-table:impact-reports"
};

type ChecklistState = Record<string, string[]>;

export type SavedLocation = {
  label: string;
  addressLine2?: string;
};

type SavedRecipeSummary = {
  id: string;
  title: string;
  image: string | null;
  source: string;
  summary: string;
  labels: string[];
};

export type StoredStoreResult = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  googleMapsUri: string | null;
  primaryType: string | null;
  types?: string[];
  confidenceTier?: "high" | "medium" | "low";
  matchReason?: string;
};

export type StoredStoreSearchResult = {
  recipeId: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
  stores: StoredStoreResult[];
  missingIngredients: string[];
};

export type StoredImpactReport = {
  recipeId: string;
  recipeCarbonClass: string | null;
  recipeCarbonScore?: number | null;
  tripDistanceMiles: number;
  tripCarbonKg: number | null;
  tripCarbonScore?: number | null;
  overallImpactScore?: number | null;
  overallImpactLabel?: string | null;
  scoreWeighting?: string;
  factorName?: string;
  factorRegion?: string | null;
  estimatedStoreName?: string;
  tripError?: string;
};

type StoreResultState = Record<string, StoredStoreSearchResult>;
type ImpactReportState = Record<string, StoredImpactReport>;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getCheckedIngredientIds(recipeId: string) {
  const state = readJson<ChecklistState>(KEYS.checklist, {});
  return state[recipeId] ?? [];
}

export function setCheckedIngredientIds(recipeId: string, ids: string[]) {
  const state = readJson<ChecklistState>(KEYS.checklist, {});
  state[recipeId] = ids;
  writeJson(KEYS.checklist, state);
}

export function countMissingIngredients(
  recipeId: string,
  ingredients: RecipeIngredient[]
) {
  const checked = new Set(getCheckedIngredientIds(recipeId));
  return ingredients.filter((ingredient) => !checked.has(ingredient.id)).length;
}

export function getSavedLocation() {
  return readJson<SavedLocation | null>(KEYS.location, null);
}

export function setSavedLocation(location: SavedLocation) {
  writeJson(KEYS.location, location);
}

export function clearSavedLocation() {
  window.localStorage.removeItem(KEYS.location);
}

export function getSavedRecipes() {
  return readJson<SavedRecipeSummary[]>(KEYS.savedRecipes, []);
}

export function saveRecipeSummary(recipe: Recipe) {
  const current = getSavedRecipes();
  const next = [
    {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      source: recipe.source,
      summary: recipe.summary,
      labels: recipe.labels
    },
    ...current.filter((item) => item.id !== recipe.id)
  ];

  writeJson(KEYS.savedRecipes, next);
}

export function removeSavedRecipe(recipeId: string) {
  const current = getSavedRecipes();
  writeJson(
    KEYS.savedRecipes,
    current.filter((item) => item.id !== recipeId)
  );
}

export function getStoreResults(recipeId: string) {
  const state = readJson<StoreResultState>(KEYS.storeResults, {});
  return state[recipeId] ?? null;
}

export function saveStoreResults(recipeId: string, result: StoredStoreSearchResult) {
  const state = readJson<StoreResultState>(KEYS.storeResults, {});
  state[recipeId] = result;
  writeJson(KEYS.storeResults, state);
}

export function getImpactReport(recipeId: string) {
  const state = readJson<ImpactReportState>(KEYS.impactReports, {});
  return state[recipeId] ?? null;
}

export function saveImpactReport(recipeId: string, report: StoredImpactReport) {
  const state = readJson<ImpactReportState>(KEYS.impactReports, {});
  state[recipeId] = report;
  writeJson(KEYS.impactReports, state);
}
