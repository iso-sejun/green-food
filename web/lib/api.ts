import { Recipe, RecipeSearchResponse } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export async function fetchRecipeSearch(
  query: string,
  nextPage?: string | null
): Promise<RecipeSearchResponse> {
  const url = new URL("/api/recipes/search", API_BASE_URL);

  if (query) {
    url.searchParams.set("q", query);
  }

  if (nextPage) {
    url.searchParams.set("nextPage", nextPage);
  }

  const response = await fetch(url.toString(), {
    cache: "no-store"
  });

  return parseResponse<RecipeSearchResponse>(response);
}

export async function fetchRecipeDetail(id: string): Promise<Recipe> {
  const response = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
    cache: "no-store"
  });

  return parseResponse<Recipe>(response);
}

export async function geocodeLocation(address: string): Promise<{
  label: string;
  latitude: number;
  longitude: number;
  placeId: string | null;
}> {
  const response = await fetch(`${API_BASE_URL}/api/maps/geocode`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ address })
  });

  return parseResponse(response);
}

export async function fetchNearbyStores(latitude: number, longitude: number): Promise<{
  stores: Array<{
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    googleMapsUri: string | null;
    primaryType: string | null;
  }>;
}> {
  const response = await fetch(`${API_BASE_URL}/api/maps/nearby-stores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ latitude, longitude })
  });

  return parseResponse(response);
}

export async function estimateTripImpact(distanceMiles: number): Promise<{
  co2eKg: number | null;
  co2eUnit: string;
  activityId: string;
  factorName: string;
  factorRegion: string | null;
  distanceKm: number;
}> {
  const response = await fetch(`${API_BASE_URL}/api/impact/trip`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ distanceMiles })
  });

  return parseResponse(response);
}
