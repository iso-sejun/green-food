import { Recipe } from "./types";

const recipeSessionCache = new Map<string, Recipe>();

export function getRecipeFromSessionCache(recipeId: string) {
  return recipeSessionCache.get(recipeId) ?? null;
}

export function setRecipeInSessionCache(recipe: Recipe) {
  recipeSessionCache.set(recipe.id, recipe);
  return recipe;
}

export function clearRecipeSessionCache() {
  recipeSessionCache.clear();
}

