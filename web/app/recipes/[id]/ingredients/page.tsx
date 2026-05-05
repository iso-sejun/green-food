import Link from "next/link";
import { IngredientChecklist } from "@/components/ingredient-checklist";
import { fetchRecipeDetail } from "@/lib/api";

type IngredientChecklistPageProps = {
  params: Promise<{ id: string }>;
};

export default async function IngredientChecklistPage({
  params
}: IngredientChecklistPageProps) {
  const { id } = await params;
  const recipe = await fetchRecipeDetail(id);

  return (
    <main className="section">
      <div className="page-shell grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="eyebrow">Ingredient Checklist</span>
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold tracking-[-0.04em] text-[var(--bg-navy)] md:text-6xl">
            {recipe.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--text-soft)]">
            Mark what you already have so the next step can focus on the items
            you still need to find nearby.
          </p>
          <div className="mt-8">
            <IngredientChecklist
              recipeId={recipe.id}
              ingredients={recipe.ingredients}
            />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card-surface bg-[var(--bg-mint)] p-6 text-[var(--bg-navy)] md:p-8">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight">
              Next up: nearby store recommendations
            </h2>
            <p className="mt-4 text-lg leading-8 text-[rgba(16,28,48,0.82)]">
              We&apos;ll use your saved checklist and location to look for stores
              within 10 miles that are likely to carry the remaining items.
            </p>
            <Link
              href={`/recipes/${recipe.id}/stores`}
              className="cta cta-primary mt-6"
            >
              Continue to stores
            </Link>
          </div>

          <div className="card-surface bg-white p-6 md:p-8">
            <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--bg-navy)]">
              Checklist notes
            </h3>
            <ul className="mt-4 space-y-3 text-base leading-7 text-[var(--text-soft)]">
              <li>Checked ingredients are stored in local storage for this browser.</li>
              <li>Edamam may not return categories for every ingredient.</li>
              <li>The next store step will recommend likely matches, not confirmed inventory.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
