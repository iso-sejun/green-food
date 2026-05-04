"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getImpactReport,
  getSavedRecipes,
  getStoreResults,
  removeSavedRecipe
} from "@/lib/local-storage";
import { toRecipePathSegment } from "@/lib/recipe-routing";

type SavedRecipeCard = ReturnType<typeof getSavedRecipes>[number];

export function SavedRecipesBrowser() {
  const [recipes, setRecipes] = useState<SavedRecipeCard[]>([]);

  useEffect(() => {
    function sync() {
      setRecipes(getSavedRecipes());
    }

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("green-table:saved-recipes-updated", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("green-table:saved-recipes-updated", sync);
    };
  }, []);

  function onRemove(recipeId: string) {
    removeSavedRecipe(recipeId);
    window.dispatchEvent(new Event("green-table:saved-recipes-updated"));
    setRecipes(getSavedRecipes());
  }

  if (!recipes.length) {
    return (
      <div className="card-surface bg-white p-8">
        <p className="text-lg text-[var(--text-soft)]">
          No saved recipes yet. Recipes are saved automatically when you reach the
          nearby store step.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {recipes.map((recipe) => {
        const storeResults = getStoreResults(recipe.id);
        const impactReport = getImpactReport(recipe.id);

        return (
          <article
            key={recipe.id}
            className="card-surface grid overflow-hidden bg-white md:grid-cols-[280px_1fr]"
          >
            <div className="relative min-h-[220px] bg-[var(--bg-sky)]">
              {recipe.image ? (
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 280px"
                />
              ) : null}
            </div>
            <div className="p-6 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-soft)]">
                {recipe.source}
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--bg-navy)]">
                {recipe.title}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {recipe.labels.map((label) => (
                  <span key={label} className="pill">
                    {label}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-lg leading-8 text-[var(--text-soft)]">
                {recipe.summary}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/recipes/${toRecipePathSegment(recipe.id)}`}
                  className="rounded-full bg-[var(--bg-navy)] px-5 py-3 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.08em] text-white"
                >
                  Open recipe
                </Link>
                {storeResults ? (
                  <Link
                    href={`/recipes/${toRecipePathSegment(recipe.id)}/stores`}
                    className="rounded-full border border-[var(--line)] px-5 py-3 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.08em] text-[var(--bg-navy)]"
                  >
                    Return to map
                  </Link>
                ) : null}
                {impactReport ? (
                  <Link
                    href={`/recipes/${toRecipePathSegment(recipe.id)}/impact`}
                    className="rounded-full border border-[var(--line)] px-5 py-3 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.08em] text-[var(--bg-navy)]"
                  >
                    View impact
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => onRemove(recipe.id)}
                  className="rounded-full border border-red-200 px-5 py-3 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.08em] text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
