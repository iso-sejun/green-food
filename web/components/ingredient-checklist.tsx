"use client";

import { useMemo, useState } from "react";
import {
  getCheckedIngredientIds,
  setCheckedIngredientIds
} from "@/lib/local-storage";
import { RecipeIngredient } from "@/lib/types";

type IngredientChecklistProps = {
  recipeId: string;
  ingredients: RecipeIngredient[];
};

export function IngredientChecklist({
  recipeId,
  ingredients
}: IngredientChecklistProps) {
  const [checkedIds, setCheckedIds] = useState<string[]>(() =>
    getCheckedIngredientIds(recipeId)
  );

  const checkedSet = useMemo(() => new Set(checkedIds), [checkedIds]);
  const missingCount = ingredients.filter(
    (ingredient) => !checkedSet.has(ingredient.id)
  ).length;
  const sortedIngredients = useMemo(() => {
    const unchecked = ingredients.filter((ingredient) => !checkedSet.has(ingredient.id));
    const checked = ingredients.filter((ingredient) => checkedSet.has(ingredient.id));

    return [...unchecked, ...checked];
  }, [checkedSet, ingredients]);

  function toggleIngredient(ingredientId: string) {
    const next = checkedSet.has(ingredientId)
      ? checkedIds.filter((id) => id !== ingredientId)
      : [...checkedIds, ingredientId];

    setCheckedIds(next);
    setCheckedIngredientIds(recipeId, next);
  }

  return (
    <div className="card-surface bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.03em] text-[var(--bg-navy)]">
            Check off what you already have
          </h2>
          <p className="mt-2 text-base leading-7 text-[var(--text-soft)]">
            We&apos;ll use the remaining ingredients to guide the nearby store step.
          </p>
        </div>
        <div className="rounded-full bg-[var(--bg-mint)] px-4 py-2 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.08em] text-[var(--bg-navy)]">
          {missingCount} still needed
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {sortedIngredients.map((ingredient) => {
          const checked = checkedSet.has(ingredient.id);

          return (
            <label
              key={ingredient.id}
              className={`flex cursor-pointer items-start gap-4 rounded-[1.25rem] border px-4 py-4 transition ${
                checked
                  ? "border-[rgba(120,220,168,0.9)] bg-[rgba(120,220,168,0.22)]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleIngredient(ingredient.id)}
                className="mt-1 h-5 w-5 rounded border-slate-300 accent-[var(--bg-navy)]"
              />
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p
                    className={`text-lg font-semibold ${
                      checked ? "text-[rgba(18,33,51,0.66)] line-through" : "text-[var(--bg-navy)]"
                    }`}
                  >
                    {ingredient.text}
                  </p>
                  {checked ? (
                    <span className="rounded-full bg-[var(--bg-navy)] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-white">
                      Already have
                    </span>
                  ) : null}
                </div>
                <p
                  className={`mt-1 text-sm leading-6 ${
                    checked ? "text-[rgba(73,89,107,0.82)]" : "text-[var(--text-soft)]"
                  }`}
                >
                  {ingredient.category
                    ? `Likely category: ${ingredient.category}`
                    : "No ingredient category returned by Edamam for this item."}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
