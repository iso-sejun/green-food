import { RecipesBrowser } from "@/components/recipes-browser";
import { SearchHero } from "@/components/search-hero";
import { fetchRecipeSearch } from "@/lib/api";

type RecipesPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const { q = "" } = await searchParams;
  const result = await fetchRecipeSearch(q);

  return (
    <main className="section">
      <div className="page-shell">
        <span className="eyebrow">Recipe Results</span>
        <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold tracking-[-0.04em] text-[var(--bg-navy)] md:text-6xl">
          {q ? `Recipes for “${q}”` : "Recipe listing"}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--text-soft)]">
          {q
            ? `Showing Edamam recipes that match your search, with cuisine and diet labels in place of star ratings.`
            : "Showing a broad Edamam recipe pull so users can browse even before typing a query."}
        </p>
        <SearchHero initialQuery={q} variant="compact" />
        <RecipesBrowser key={q} initialQuery={q} initialResult={result} />
      </div>
    </main>
  );
}
