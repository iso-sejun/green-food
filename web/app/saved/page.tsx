import { SavedRecipesBrowser } from "@/components/saved-recipes-browser";

export default function SavedRecipesPage() {
  return (
    <main className="section">
      <div className="page-shell">
        <span className="eyebrow">Saved Recipes</span>
        <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold tracking-[-0.04em] text-[var(--bg-navy)] md:text-6xl">
          Saved recipes
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--text-soft)]">
          Recipes are saved when you reach the nearby-store step, so you can jump
          back into sourcing and impact review later.
        </p>
        <div className="mt-10">
          <SavedRecipesBrowser />
        </div>
      </div>
    </main>
  );
}
