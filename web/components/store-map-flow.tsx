"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchNearbyStores, fetchRecipeDetail, geocodeLocation } from "@/lib/api";
import {
  getCheckedIngredientIds,
  getSavedLocation,
  saveRecipeSummary,
  saveStoreResults,
  StoredStoreResult
} from "@/lib/local-storage";
import { toRecipeLocationQuery, toRecipePathSegment } from "@/lib/recipe-routing";
import {
  getRecipeFromSessionCache,
  setRecipeInSessionCache
} from "@/lib/recipe-session-cache";
import { Recipe } from "@/lib/types";
import { GoogleMap } from "./google-map";

type StoreMapFlowProps = {
  recipeId: string;
  browserMapsApiKey: string;
};

export function StoreMapFlow({
  recipeId,
  browserMapsApiKey
}: StoreMapFlowProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [stores, setStores] = useState<StoredStoreResult[]>([]);
  const [missingIngredients, setMissingIngredients] = useState<string[]>([]);
  const [locationLabel, setLocationLabel] = useState("");
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const savedLocation = getSavedLocation();

        if (!savedLocation) {
          throw new Error("No saved location found. Please add your location first.");
        }

        const cachedRecipe = getRecipeFromSessionCache(recipeId);
        const [recipeDetail, geo] = await Promise.all([
          cachedRecipe ? Promise.resolve(cachedRecipe) : fetchRecipeDetail(recipeId),
          geocodeLocation(savedLocation.label)
        ]);

        if (cancelled) {
          return;
        }

        const checkedIds = new Set(getCheckedIngredientIds(recipeId));
        const remaining = recipeDetail.ingredients
          .filter((ingredient) => !checkedIds.has(ingredient.id))
          .map((ingredient) => ingredient.food || ingredient.text);

        const storeResponse = await fetchNearbyStores(geo.latitude, geo.longitude);

        if (cancelled) {
          return;
        }

        setRecipe(recipeDetail);
        setMissingIngredients(remaining);
        setLocationLabel(geo.label);
        setCoordinates({
          latitude: geo.latitude,
          longitude: geo.longitude
        });
        setStores(storeResponse.stores);
        setStatus("ready");

        saveRecipeSummary(recipeDetail);
        setRecipeInSessionCache(recipeDetail);
        saveStoreResults(recipeId, {
          recipeId,
          locationLabel: geo.label,
          latitude: geo.latitude,
          longitude: geo.longitude,
          stores: storeResponse.stores,
          missingIngredients: remaining
        });
        window.dispatchEvent(new Event("green-table:saved-recipes-updated"));
      } catch (loadError) {
        if (!cancelled) {
          setStatus("error");
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load nearby stores."
          );
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [recipeId]);

  const topIngredients = useMemo(() => missingIngredients.slice(0, 8), [missingIngredients]);

  if (status === "loading") {
    return (
      <div className="card-surface bg-white p-8 text-lg text-[var(--text-soft)]">
        Searching for nearby stores and preparing the ingredient shortlist...
      </div>
    );
  }

  if (status === "error" || !recipe || !coordinates) {
    return (
      <div className="card-surface bg-white p-8">
        <p className="text-lg text-red-700">{error ?? "Unable to load the map step."}</p>
        <Link
          href={`/location?recipeId=${toRecipeLocationQuery(recipeId)}`}
          className="cta cta-primary mt-6"
        >
          Update location
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <GoogleMap
          apiKey={browserMapsApiKey}
          center={coordinates}
          userLabel={locationLabel}
          markers={stores}
        />
        <div className="card-surface bg-white p-6 md:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--bg-navy)]">
            Nearby stores likely to carry what&apos;s left
          </h2>
          <p className="mt-3 text-lg leading-8 text-[var(--text-soft)]">
            These are nearby grocery-oriented places within roughly 10 miles of your
            saved location. This is a recommendation layer, not confirmed inventory.
          </p>
          <div className="mt-6 grid gap-4">
            {stores.map((store, index) => (
              <article
                key={`${store.name}-${store.address}`}
                className="rounded-[1.25rem] border border-slate-200 bg-[var(--bg-cream)] p-5"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-soft)]">
                  Stop {index + 1}
                </p>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--bg-navy)]">
                  {store.name}
                </h3>
                <p className="mt-2 text-base leading-7 text-[var(--text-soft)]">
                  {store.address}
                </p>
                {store.googleMapsUri ? (
                  <a
                    href={store.googleMapsUri}
                    target="_blank"
                    rel="noreferrer"
                    className="cta cta-secondary mt-4"
                  >
                    Open in Google Maps
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="card-surface bg-[var(--bg-mint)] p-6 text-[var(--bg-navy)] md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[rgba(16,28,48,0.72)]">
            Missing Ingredients
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight">
            {missingIngredients.length} ingredients still on your list
          </h2>
          <ul className="mt-5 space-y-3 text-base leading-7 text-[rgba(16,28,48,0.84)]">
            {topIngredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </div>

        <div className="card-surface bg-[var(--bg-navy)] p-6 text-white md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white/65">
            Saved Recipe
          </p>
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight">
            {recipe.title} has been added to your saved recipes.
          </h3>
          <p className="mt-4 text-lg leading-8 text-white/75">
            We save it here so you can return to the store map and, once available,
            the environmental report later.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/saved"
              className="cta cta-accent"
            >
              View saved recipes
            </Link>
            <Link
              href={`/recipes/${toRecipePathSegment(recipeId)}/impact`}
              className="cta cta-secondary-inverse"
            >
              Continue to impact
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
