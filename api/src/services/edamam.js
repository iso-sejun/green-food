import { HttpError } from "../lib/http-error.js";
import { requireEnv } from "../lib/env.js";

function buildRecipeId(uri) {
  return encodeURIComponent(uri);
}

function normalizeLabels(recipe) {
  const cuisine = recipe.cuisineType ?? [];
  const diet = recipe.dietLabels ?? [];
  const health = recipe.healthLabels ?? [];

  return [...cuisine, ...diet, ...health].slice(0, 6);
}

function summarizeRecipe(recipe) {
  const parts = [];

  if (recipe.cuisineType?.length) {
    parts.push(`${recipe.cuisineType[0]} cuisine`);
  }

  if (recipe.dishType?.length) {
    parts.push(recipe.dishType[0]);
  }

  if (recipe.mealType?.length) {
    parts.push(recipe.mealType[0]);
  }

  if (recipe.healthLabels?.length) {
    parts.push(recipe.healthLabels.slice(0, 2).join(", "));
  }

  return parts.length
    ? parts.join(" • ")
    : "A recipe sourced from Edamam with ingredient and nutrition context.";
}

function normalizeIngredient(ingredient, index) {
  return {
    id: `${ingredient.foodId ?? ingredient.food ?? "ingredient"}-${index}`,
    text: ingredient.text ?? ingredient.food ?? "Ingredient",
    food: ingredient.food ?? ingredient.text ?? "Ingredient",
    quantity: ingredient.quantity ?? null,
    measure: ingredient.measure ?? null,
    weight: ingredient.weight ?? null,
    category: ingredient.foodCategory ?? null
  };
}

function normalizeRecipe(recipe) {
  return {
    id: buildRecipeId(recipe.uri),
    uri: recipe.uri,
    title: recipe.label,
    image: recipe.images?.LARGE?.url ?? recipe.image ?? null,
    source: recipe.source,
    sourceUrl: recipe.url,
    cuisineLabels: recipe.cuisineType ?? [],
    dietLabels: recipe.dietLabels ?? [],
    healthLabels: recipe.healthLabels ?? [],
    mealType: recipe.mealType ?? [],
    dishType: recipe.dishType ?? [],
    totalTime: recipe.totalTime ?? null,
    servings: recipe.yield ?? null,
    calories: recipe.calories ?? null,
    ingredientLines: recipe.ingredientLines ?? [],
    ingredients: (recipe.ingredients ?? []).map(normalizeIngredient),
    co2EmissionsClass: recipe.co2EmissionsClass ?? null,
    summary: summarizeRecipe(recipe),
    labels: normalizeLabels(recipe)
  };
}

function encodeNextPage(url) {
  return Buffer.from(url, "utf8").toString("base64url");
}

function decodeNextPage(token) {
  return Buffer.from(token, "base64url").toString("utf8");
}

async function edamamRequest(path, params) {
  const appId = requireEnv("EDAMAM_APP_ID");
  const appKey = requireEnv("EDAMAM_APP_KEY");

  const url = new URL(path, "https://api.edamam.com");
  url.searchParams.set("type", "public");
  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url);

  if (!response.ok) {
    const message = await response.text();
    throw new HttpError(response.status, "Edamam request failed", {
      provider: "edamam",
      message
    });
  }

  return response.json();
}

async function edamamAbsoluteRequest(urlString) {
  const url = new URL(urlString);

  if (url.origin !== "https://api.edamam.com") {
    throw new HttpError(400, "Invalid Edamam pagination url");
  }

  const response = await fetch(url);

  if (!response.ok) {
    const message = await response.text();
    throw new HttpError(response.status, "Edamam request failed", {
      provider: "edamam",
      message
    });
  }

  return response.json();
}

function normalizeSearchResult(data, query) {
  const nextHref = data._links?.next?.href ?? null;

  return {
    query,
    total: data.count ?? 0,
    from: data.from ?? 0,
    to: data.to ?? 0,
    nextPage: nextHref ? encodeNextPage(nextHref) : null,
    recipes: (data.hits ?? []).map((hit) => normalizeRecipe(hit.recipe))
  };
}

export async function searchRecipes(query) {
  const data = await edamamRequest("/api/recipes/v2", {
    q: query || "recipe",
    beta: true,
    imageSize: "LARGE",
    random: false
  });

  return normalizeSearchResult(data, query);
}

export async function searchRecipesNextPage(nextPageToken, query) {
  const nextUrl = decodeNextPage(nextPageToken);
  const data = await edamamAbsoluteRequest(nextUrl);

  return normalizeSearchResult(data, query);
}

export async function getRecipeById(id) {
  const uri = decodeURIComponent(id);
  const data = await edamamRequest("/api/recipes/v2/by-uri", {
    uri,
    beta: true
  });

  const recipe = data.hits?.[0]?.recipe;

  if (!recipe) {
    throw new HttpError(404, "Recipe not found");
  }

  return normalizeRecipe(recipe);
}
