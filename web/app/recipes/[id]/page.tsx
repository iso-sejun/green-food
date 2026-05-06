import Link from "next/link";
import { RecipeImage } from "@/components/recipe-image";
import { fetchRecipeDetail } from "@/lib/api";
import { toRecipeLocationQuery, toRecipePathSegment } from "@/lib/recipe-routing";

type RecipeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RecipeDetailPage({
  params
}: RecipeDetailPageProps) {
  const { id } = await params;
  const recipe = await fetchRecipeDetail(id);

  return (
    <main className="section">
      <div className="page-shell grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="card-surface overflow-hidden bg-white">
          <RecipeImage
            src={recipe.image}
            alt={recipe.title}
            sizes="(max-width: 1280px) 100vw, 720px"
            containerClassName="relative min-h-[320px] bg-[var(--bg-sky)] md:min-h-[480px]"
            fallbackClassName="flex h-full items-center justify-center px-10 text-center font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--bg-navy)]"
          />
          <div className="p-6 md:p-8">
            <span className="eyebrow">Recipe Detail</span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-tight tracking-[-0.04em] text-[var(--bg-navy)] md:text-6xl">
              {recipe.title}
            </h1>
            <div className="mt-5 flex flex-wrap gap-2">
              {recipe.labels.map((label) => (
                <span key={label} className="pill">
                  {label}
                </span>
              ))}
            </div>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--text-soft)]">
              {recipe.summary}
            </p>
            <div className="mt-8 grid gap-4 rounded-[1.4rem] bg-[var(--bg-cream)] p-5 md:grid-cols-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-soft)]">
                  Source
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--bg-navy)]">
                  {recipe.source}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-soft)]">
                  Servings
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--bg-navy)]">
                  {recipe.servings ?? "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-soft)]">
                  Carbon class
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--bg-navy)]">
                  {recipe.co2EmissionsClass ?? "Unavailable"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <div className="card-surface bg-[var(--bg-navy)] p-6 text-white md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white/65">
              Start Making
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight">
              Ready to move from recipe to sourcing?
            </h2>
            <p className="mt-4 text-lg leading-8 text-white/75">
              We&apos;ll confirm your location next, then let you check off the
              ingredients you already have before recommending nearby stores.
            </p>
            <Link
              href={`/location?recipeId=${toRecipeLocationQuery(recipe.id)}`}
              className="cta cta-accent mt-6"
            >
              Start making
            </Link>
          </div>

          <div className="card-surface bg-white p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-soft)]">
              Ingredients
            </p>
            <ul className="mt-4 space-y-3 text-base leading-7 text-[var(--text-soft)]">
              {recipe.ingredientLines.slice(0, 8).map((line) => (
                <li key={line} className="rounded-2xl bg-[var(--bg-cream)] px-4 py-3">
                  {line}
                </li>
              ))}
            </ul>
            <Link
              href={`/recipes/${toRecipePathSegment(recipe.id)}/ingredients`}
              className="cta cta-secondary mt-6"
            >
              Review full checklist
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
