"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type SearchHeroProps = {
  initialQuery?: string;
  variant?: "hero" | "compact";
};

export function SearchHero({
  initialQuery = "",
  variant = "hero"
}: SearchHeroProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const isCompact = variant === "compact";

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = query.trim();
    router.push(nextQuery ? `/recipes?q=${encodeURIComponent(nextQuery)}` : "/recipes");
  }

  if (isCompact) {
    return (
      <form
        onSubmit={onSubmit}
        className="card-surface mt-8 overflow-hidden bg-[var(--bg-navy)] p-6 text-[var(--text-inverse)] md:p-8"
      >
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="pill border-white/15 bg-white/10 text-white">
            Refine search
          </span>
          <span className="pill border-white/15 bg-white/10 text-white">
            Edamam recipes
          </span>
        </div>
        <label
          htmlFor="recipe-query-compact"
          className="mb-3 block font-[family-name:var(--font-display)] text-2xl font-bold"
        >
          Search for a recipe
        </label>
        <div className="rounded-[1.4rem] bg-white p-3 text-[var(--text-ink)] shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
          <input
            id="recipe-query-compact"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try jollof rice, ramen, pozole, or all recipes"
            className="w-full border-0 bg-transparent px-3 py-4 text-lg outline-none placeholder:text-slate-400"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-3 pt-3">
            <p className="max-w-xs text-sm text-slate-500">
              Update the list with a new dish or leave it blank to browse more broadly.
            </p>
            <button
              type="submit"
              className="cta cta-accent transition hover:translate-y-[-1px]"
            >
              Search recipes
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <section className="section">
      <div className="page-shell">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="mx-auto max-w-4xl font-[family-name:var(--font-display)] text-2xl font-bold leading-[1.04] tracking-[-0.03em] text-[var(--bg-navy)] md:text-3xl xl:text-[2.75rem]">
            Discover recipes worth preserving and ingredients worth sourcing thoughtfully.
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)] md:text-lg">
            Green Table helps you search dishes, check what you already have,
            find nearby stores likely to carry the rest, and understand the
            environmental tradeoffs before you cook.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="card-surface mx-auto mt-8 max-w-4xl overflow-hidden bg-[var(--bg-navy)] p-6 text-[var(--text-inverse)] shadow-[0_28px_70px_rgba(16,28,48,0.22)] md:p-8"
        >
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            <span className="pill border-white/15 bg-white/10 text-white">
              Edamam recipes
            </span>
            <span className="pill border-white/15 bg-white/10 text-white">
              Nearby store map
            </span>
            <span className="pill border-white/15 bg-white/10 text-white">
              Hybrid carbon estimate
            </span>
          </div>
          <label
            htmlFor="recipe-query-hero"
            className="mb-3 block text-center font-[family-name:var(--font-display)] text-3xl font-bold md:text-4xl"
          >
            Search for a recipe
          </label>
          <div className="rounded-[1.4rem] bg-white p-3 text-[var(--text-ink)] shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
            <input
              id="recipe-query-hero"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try jollof rice, ramen, pozole, or all recipes"
              className="w-full border-0 bg-transparent px-3 py-5 text-xl outline-none placeholder:text-slate-400 md:text-2xl"
            />
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-3 pt-4">
              <p className="max-w-xl text-sm leading-6 text-slate-500">
                If you leave this blank, the recipe page will show everything we have fetched.
              </p>
              <button
                type="submit"
                className="cta cta-accent min-w-[220px] transition hover:translate-y-[-1px]"
              >
                Search recipes
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
