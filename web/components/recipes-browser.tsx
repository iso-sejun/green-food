"use client";

import { useState, useTransition } from "react";
import { fetchRecipeSearch } from "@/lib/api";
import { Recipe, RecipeSearchResponse } from "@/lib/types";
import { RecipeCard } from "./recipe-card";

type RecipesBrowserProps = {
  initialQuery: string;
  initialResult: RecipeSearchResponse;
};

export function RecipesBrowser({
  initialQuery,
  initialResult
}: RecipesBrowserProps) {
  const initialVisibleCount = Math.min(10, initialResult.recipes.length);
  const totalResults = initialResult.total;
  const [recipes, setRecipes] = useState<Recipe[]>(initialResult.recipes);
  const [nextPage, setNextPage] = useState<string | null>(initialResult.nextPage);
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const [isLoadingMore, startLoadMore] = useTransition();
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  function loadMore() {
    if (visibleCount < recipes.length) {
      setVisibleCount((current) => Math.min(current + 10, recipes.length));
      return;
    }

    if (!nextPage) {
      return;
    }

    setLoadMoreError(null);

    startLoadMore(async () => {
      try {
        const result = await fetchRecipeSearch(initialQuery, nextPage);
        setRecipes((current) => [...current, ...result.recipes]);
        setNextPage(result.nextPage);
        setVisibleCount((current) => current + Math.min(10, result.recipes.length));
      } catch (error) {
        setLoadMoreError(
          error instanceof Error ? error.message : "Unable to load more recipes."
        );
      }
    });
  }

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-[var(--text-soft)]">
        <span>
          Showing {Math.min(visibleCount, recipes.length)} of{" "}
          {totalResults.toLocaleString()} results
        </span>
        <span>{recipes.length} currently loaded from Edamam</span>
      </div>

      <div className="mt-10 grid gap-6">
        {recipes.length ? (
          recipes
            .slice(0, visibleCount)
            .map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)
        ) : (
          <div className="card-surface bg-white p-8">
            <p className="text-lg text-[var(--text-soft)]">
              No recipes matched that search.
            </p>
          </div>
        )}
      </div>

      {loadMoreError ? (
        <p className="mt-6 text-sm font-semibold text-red-700">{loadMoreError}</p>
      ) : null}

      {visibleCount < totalResults ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="cta cta-secondary transition hover:translate-y-[-1px] disabled:cursor-wait disabled:opacity-65"
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      ) : null}
    </>
  );
}
