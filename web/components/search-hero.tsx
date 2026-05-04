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
              className="rounded-full bg-[var(--bg-mint)] px-5 py-3 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.08em] text-[var(--bg-navy)] transition hover:translate-y-[-1px]"
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
      <div className="page-shell grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <span className="eyebrow">Cook Heritage, Lighten Impact</span>
          <h1 className="max-w-4xl font-[family-name:var(--font-display)] text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-[var(--bg-navy)] md:text-7xl xl:text-[5.4rem]">
            Discover recipes worth preserving and ingredients worth sourcing thoughtfully.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-soft)] md:text-xl">
            Green Table helps you search dishes, check what you already have,
            find nearby stores likely to carry the rest, and understand the
            environmental tradeoffs before you cook.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="card-surface overflow-hidden bg-[var(--bg-navy)] p-6 text-[var(--text-inverse)] md:p-8"
        >
          <div className="mb-6 flex flex-wrap gap-2">
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
            className="mb-3 block font-[family-name:var(--font-display)] text-2xl font-bold"
          >
            Search for a recipe
          </label>
          <div className="rounded-[1.4rem] bg-white p-3 text-[var(--text-ink)] shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
            <input
              id="recipe-query-hero"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try jollof rice, ramen, pozole, or all recipes"
              className="w-full border-0 bg-transparent px-3 py-4 text-lg outline-none placeholder:text-slate-400"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-3 pt-3">
              <p className="max-w-xs text-sm text-slate-500">
                If you leave this blank, the recipe page will show everything we have fetched.
              </p>
              <button
                type="submit"
                className="rounded-full bg-[var(--bg-mint)] px-5 py-3 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.08em] text-[var(--bg-navy)] transition hover:translate-y-[-1px]"
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
