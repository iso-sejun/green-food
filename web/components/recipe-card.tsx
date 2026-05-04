import Image from "next/image";
import Link from "next/link";
import { Recipe } from "@/lib/types";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="card-surface grid overflow-hidden bg-white transition duration-200 hover:translate-y-[-3px] md:grid-cols-[280px_1fr]"
    >
      <div className="relative min-h-[240px] bg-[var(--bg-sky)]">
        {recipe.image ? (
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 280px"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-8 text-center font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--bg-navy)]">
            No image available
          </div>
        )}
      </div>
      <div className="flex flex-col justify-between p-6 md:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-soft)]">
            {recipe.source}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-[-0.03em] text-[var(--bg-navy)]">
            {recipe.title}
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {recipe.labels.length ? (
              recipe.labels.map((label) => (
                <span key={label} className="pill">
                  {label}
                </span>
              ))
            ) : (
              <span className="pill">Recipe labels unavailable</span>
            )}
          </div>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text-soft)]">
            {recipe.summary}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-[var(--text-soft)]">
          {recipe.servings ? <span>{recipe.servings} servings</span> : null}
          {recipe.totalTime ? <span>{recipe.totalTime} min</span> : null}
          {recipe.co2EmissionsClass ? (
            <span>Recipe carbon class {recipe.co2EmissionsClass}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

