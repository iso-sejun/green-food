import { HttpError } from "../lib/http-error.js";
import { requireEnv } from "../lib/env.js";

const TEN_MILES_IN_METERS = 16093.4;

async function googleRequest(url, options = {}) {
  const apiKey = requireEnv("GOOGLE_MAPS_API_KEY");
  const headers = new Headers(options.headers ?? {});
  headers.set("X-Goog-Api-Key", apiKey);

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const message = await response.text();
    throw new HttpError(response.status, "Google Maps request failed", {
      provider: "google-maps",
      message
    });
  }

  return response.json();
}

export async function geocodeAddress(address) {
  if (!address?.trim()) {
    throw new HttpError(400, "Address is required");
  }

  const encodedAddress = encodeURIComponent(address.trim());
  const url = `https://geocode.googleapis.com/v4beta/geocode/address/${encodedAddress}`;
  const data = await googleRequest(url);
  const result = data.results?.[0];

  if (!result?.location) {
    throw new HttpError(404, "Unable to geocode that address");
  }

  return {
    label: result.formattedAddress ?? address.trim(),
    latitude: result.location.latitude,
    longitude: result.location.longitude,
    placeId: result.placeId ?? null
  };
}

export async function searchNearbyStores({ latitude, longitude }) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new HttpError(400, "Latitude and longitude are required");
  }

  const url = "https://places.googleapis.com/v1/places:searchNearby";
  const data = await googleRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.location,places.googleMapsUri,places.primaryType"
    },
    body: JSON.stringify({
      includedTypes: [
        "grocery_store",
        "supermarket",
        "asian_grocery_store",
        "market",
        "food_store"
      ],
      maxResultCount: 10,
      rankPreference: "DISTANCE",
      locationRestriction: {
        circle: {
          center: {
            latitude,
            longitude
          },
          radius: TEN_MILES_IN_METERS
        }
      }
    })
  });

  return (data.places ?? []).map((place, index) => ({
    id: `${place.displayName?.text ?? "store"}-${index}`,
    name: place.displayName?.text ?? "Nearby store",
    address: place.formattedAddress ?? "Address unavailable",
    latitude: place.location?.latitude ?? latitude,
    longitude: place.location?.longitude ?? longitude,
    googleMapsUri: place.googleMapsUri ?? null,
    primaryType: place.primaryType ?? null
  }));
}

