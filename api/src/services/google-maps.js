import { HttpError } from "../lib/http-error.js";
import { requireEnv } from "../lib/env.js";

const TEN_MILES_IN_METERS = 16093.4;
const MIN_STRICT_RESULTS = 5;

const STORE_SEARCH_TIERS = [
  ["grocery_store", "supermarket", "asian_grocery_store", "food_store"],
  ["grocery_store", "supermarket", "asian_grocery_store", "food_store", "market", "butcher_shop"],
  [
    "grocery_store",
    "supermarket",
    "asian_grocery_store",
    "food_store",
    "market",
    "butcher_shop"
  ]
];

const EXCLUDED_PRIMARY_TYPES = [
  "bakery",
  "cafe",
  "restaurant",
  "meal_takeaway",
  "meal_delivery",
  "bar",
  "liquor_store",
  "dessert_shop"
];

const STRICT_ALLOWED_PRIMARY_TYPES = new Set(STORE_SEARCH_TIERS[0]);
const RELAXED_ALLOWED_PRIMARY_TYPES = new Set(STORE_SEARCH_TIERS[2]);
const EXCLUDED_TYPE_SET = new Set(EXCLUDED_PRIMARY_TYPES);

const TYPE_SCORES = {
  supermarket: 100,
  grocery_store: 95,
  asian_grocery_store: 92,
  food_store: 88,
  market: 75,
  butcher_shop: 70
};

const NAME_KEYWORD_BONUS = ["market", "grocery", "foods", "supermarket", "mart"];
const CHAIN_SCORE_BONUSES = [
  { match: "walmart", bonus: 25, reason: "Matched major grocery chain Walmart" },
  { match: "fred meyer", bonus: 25, reason: "Matched major grocery chain Fred Meyer" },
  { match: "safeway", bonus: 25, reason: "Matched major grocery chain Safeway" },
  { match: "albertsons", bonus: 25, reason: "Matched major grocery chain Albertsons" },
  { match: "kroger", bonus: 25, reason: "Matched major grocery chain Kroger" },
  { match: "price chopper", bonus: 25, reason: "Matched major grocery chain Price Chopper" },
  { match: "whole foods", bonus: 22, reason: "Matched major grocery chain Whole Foods" },
  { match: "trader joe", bonus: 22, reason: "Matched major grocery chain Trader Joe's" },
  { match: "hannaford", bonus: 22, reason: "Matched major grocery chain Hannaford" },
  { match: "stop shop", bonus: 22, reason: "Matched major grocery chain Stop & Shop" },
  { match: "publix", bonus: 22, reason: "Matched major grocery chain Publix" },
  { match: "wegmans", bonus: 22, reason: "Matched major grocery chain Wegmans" },
  { match: "food lion", bonus: 22, reason: "Matched major grocery chain Food Lion" },
  { match: "shoprite", bonus: 22, reason: "Matched major grocery chain ShopRite" },
  { match: "h mart", bonus: 20, reason: "Matched specialty grocery chain H Mart" },
  { match: "hmart", bonus: 20, reason: "Matched specialty grocery chain H Mart" },
  { match: "99 ranch", bonus: 20, reason: "Matched specialty grocery chain 99 Ranch" },
  { match: "ranch 99", bonus: 20, reason: "Matched specialty grocery chain 99 Ranch" },
  { match: "patel brothers", bonus: 20, reason: "Matched specialty grocery chain Patel Brothers" }
];
const INTERNATIONAL_INGREDIENT_HINTS = [
  "soy",
  "miso",
  "gochujang",
  "fish sauce",
  "sesame oil",
  "curry paste",
  "coconut milk",
  "scotch bonnet",
  "plantain",
  "cassava",
  "tamarind",
  "garam masala",
  "rice noodles"
];
const MEAT_HINTS = ["beef", "chicken", "pork", "lamb", "goat", "turkey", "sausage", "bacon", "steak"];

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

function normalizeTextList(values) {
  return Array.isArray(values)
    ? values
        .map((value) => (typeof value === "string" ? value.trim().toLowerCase() : ""))
        .filter(Boolean)
    : [];
}

function normalizeStoreName(value) {
  return value
    .toLowerCase()
    .replace(/['’.&,-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchTiers({ ingredientNames = [], ingredientCategories = [] } = {}) {
  const normalizedNames = normalizeTextList(ingredientNames);
  const normalizedCategories = normalizeTextList(ingredientCategories);

  const prefersAsianGrocer =
    normalizedCategories.some((category) => ["legumes", "grain and pasta", "rice and products"].includes(category)) ||
    normalizedNames.some((name) =>
      INTERNATIONAL_INGREDIENT_HINTS.some((hint) => name.includes(hint))
    );

  const needsButcher =
    normalizedCategories.some((category) => ["meat", "poultry", "seafood"].includes(category)) ||
    normalizedNames.some((name) => MEAT_HINTS.some((hint) => name.includes(hint)));

  return STORE_SEARCH_TIERS.map((tier) => {
    const prioritized = [...tier];

    if (prefersAsianGrocer && prioritized.includes("asian_grocery_store")) {
      prioritized.splice(prioritized.indexOf("asian_grocery_store"), 1);
      prioritized.unshift("asian_grocery_store");
    }

    if (needsButcher && prioritized.includes("butcher_shop")) {
      prioritized.splice(prioritized.indexOf("butcher_shop"), 1);
      prioritized.unshift("butcher_shop");
    }

    return prioritized;
  });
}

function isAllowedStorePlace(place) {
  const primaryType = place.primaryType ?? null;
  const types = Array.isArray(place.types) ? place.types : [];

  if (primaryType && EXCLUDED_TYPE_SET.has(primaryType)) {
    return false;
  }

  if (types.some((type) => EXCLUDED_TYPE_SET.has(type))) {
    return false;
  }

  if (primaryType && RELAXED_ALLOWED_PRIMARY_TYPES.has(primaryType)) {
    return true;
  }

  return types.some((type) => RELAXED_ALLOWED_PRIMARY_TYPES.has(type));
}

function scoreStorePlace(place, origin) {
  const primaryType = place.primaryType ?? null;
  const types = Array.isArray(place.types) ? place.types : [];
  const rawName = place.displayName?.text ?? "";
  const normalizedName = normalizeStoreName(rawName);
  const latitude = place.location?.latitude ?? origin.latitude;
  const longitude = place.location?.longitude ?? origin.longitude;
  const distanceScore = Math.hypot(latitude - origin.latitude, longitude - origin.longitude);

  let score = TYPE_SCORES[primaryType] ?? 0;

  if (!score) {
    const matchingType = types.find((type) => TYPE_SCORES[type]);
    score = matchingType ? TYPE_SCORES[matchingType] - 5 : 0;
  }

  if (NAME_KEYWORD_BONUS.some((keyword) => normalizedName.includes(keyword))) {
    score += 10;
  }

  const chainMatch = CHAIN_SCORE_BONUSES.find(({ match }) => normalizedName.includes(match));

  if (chainMatch) {
    score += chainMatch.bonus;
  }

  const confidenceTier = STRICT_ALLOWED_PRIMARY_TYPES.has(primaryType)
    ? "high"
    : RELAXED_ALLOWED_PRIMARY_TYPES.has(primaryType)
      ? "medium"
      : "low";

  return {
    id: place.id ?? `${place.displayName?.text ?? "store"}-${latitude}-${longitude}`,
    name: place.displayName?.text ?? "Nearby store",
    address: place.formattedAddress ?? "Address unavailable",
    latitude,
    longitude,
    googleMapsUri: place.googleMapsUri ?? null,
    primaryType,
    types,
    confidenceTier,
    matchReason: chainMatch
      ? chainMatch.reason
      : primaryType
        ? `Primary type ${primaryType}`
        : types.length
          ? `Matched store type ${types.find((type) => RELAXED_ALLOWED_PRIMARY_TYPES.has(type)) ?? types[0]}`
          : "Matched by Google place data",
    score,
    distanceScore
  };
}

async function runNearbySearch({ latitude, longitude, includedPrimaryTypes }) {
  const url = "https://places.googleapis.com/v1/places:searchNearby";
  const data = await googleRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.googleMapsUri,places.primaryType,places.types"
    },
    body: JSON.stringify({
      includedPrimaryTypes,
      excludedPrimaryTypes: EXCLUDED_PRIMARY_TYPES,
      maxResultCount: 12,
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

  return data.places ?? [];
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

export async function searchNearbyStores({
  latitude,
  longitude,
  ingredientNames = [],
  ingredientCategories = []
}) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new HttpError(400, "Latitude and longitude are required");
  }

  const seen = new Set();
  const candidates = [];

  for (const tier of buildSearchTiers({ ingredientNames, ingredientCategories })) {
    const places = await runNearbySearch({ latitude, longitude, includedPrimaryTypes: tier });

    for (const place of places) {
      const placeKey = place.id ?? `${place.displayName?.text ?? "store"}-${place.formattedAddress ?? ""}`;

      if (seen.has(placeKey) || !isAllowedStorePlace(place)) {
        continue;
      }

      seen.add(placeKey);
      candidates.push(scoreStorePlace(place, { latitude, longitude }));
    }

    if (candidates.length >= MIN_STRICT_RESULTS) {
      break;
    }
  }

  return candidates
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.distanceScore - right.distanceScore;
    })
    .slice(0, 10)
    .map(({ score, distanceScore, ...store }) => store);
}
