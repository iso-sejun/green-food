"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { estimateTripImpact, fetchRecipeDetail } from "@/lib/api";
import {
  getOverallImpactLabel,
  getOverallImpactScore,
  getRecipeCarbonScore,
  getTripEmissionScore
} from "@/lib/impact-score";
import {
  getImpactReport,
  getStoreResults,
  saveImpactReport,
  saveRecipeSummary,
  StoredImpactReport
} from "@/lib/local-storage";
import { toRecipePathSegment } from "@/lib/recipe-routing";
import {
  getRecipeFromSessionCache,
  setRecipeInSessionCache
} from "@/lib/recipe-session-cache";
import { Recipe } from "@/lib/types";

const MILES_PER_KILOMETER = 0.621371;

function haversineMiles(
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number }
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const latitudeDelta = toRadians(end.latitude - start.latitude);
  const longitudeDelta = toRadians(end.longitude - start.longitude);
  const startLatitude = toRadians(start.latitude);
  const endLatitude = toRadians(end.latitude);

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMiles * c;
}

type ImpactReportFlowProps = {
  recipeId: string;
};

export function ImpactReportFlow({ recipeId }: ImpactReportFlowProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [report, setReport] = useState<StoredImpactReport | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const cached = getImpactReport(recipeId);
        const storeResults = getStoreResults(recipeId);
        const cachedRecipe = getRecipeFromSessionCache(recipeId);
        const recipeDetail = cachedRecipe ?? (await fetchRecipeDetail(recipeId));

        if (cancelled) {
          return;
        }

        saveRecipeSummary(recipeDetail);
        setRecipeInSessionCache(recipeDetail);
        setRecipe(recipeDetail);

        if (cached) {
          setReport(cached);
          setStatus("ready");
          return;
        }

        if (!storeResults || !storeResults.stores.length) {
          throw new Error(
            "No nearby store results found yet. Visit the map step before viewing the impact report."
          );
        }

        const nearestStore = storeResults.stores[0];
        const oneWayMiles = haversineMiles(
          { latitude: storeResults.latitude, longitude: storeResults.longitude },
          { latitude: nearestStore.latitude, longitude: nearestStore.longitude }
        );
        const roundTripMiles = Number((oneWayMiles * 2).toFixed(2));

        const estimate = await estimateTripImpact(roundTripMiles);

        if (cancelled) {
          return;
        }

        const recipeCarbonScore = getRecipeCarbonScore(recipeDetail.co2EmissionsClass);
        const tripCarbonScore = getTripEmissionScore(estimate.co2eKg);
        const overallImpactScore = getOverallImpactScore(
          recipeCarbonScore,
          tripCarbonScore
        );
        const overallImpactLabel = getOverallImpactLabel(overallImpactScore);

        const nextReport: StoredImpactReport = {
          recipeId,
          recipeCarbonClass: recipeDetail.co2EmissionsClass,
          recipeCarbonScore,
          tripDistanceMiles: roundTripMiles,
          tripCarbonKg: estimate.co2eKg,
          tripCarbonScore,
          overallImpactScore,
          overallImpactLabel,
          scoreWeighting: "70/30 recipe-trip",
          factorName: estimate.factorName,
          factorRegion: estimate.factorRegion,
          estimatedStoreName: nearestStore.name
        };

        saveImpactReport(recipeId, nextReport);
        window.dispatchEvent(new Event("root-and-recepie:saved-recipes-updated"));
        setReport(nextReport);
        setStatus("ready");
      } catch (loadError) {
        if (!cancelled) {
          setStatus("error");
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to build the impact report."
          );
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [recipeId]);

  const tripDistanceKm = useMemo(() => {
    if (!report) {
      return null;
    }

    return Number((report.tripDistanceMiles / MILES_PER_KILOMETER).toFixed(2));
  }, [report]);

  if (status === "loading") {
    return (
      <div className="card-surface bg-white p-8 text-lg text-[var(--text-soft)]">
        Building your hybrid environmental estimate...
      </div>
    );
  }

  if (status === "error" || !recipe || !report) {
    return (
      <div className="card-surface bg-white p-8 md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-red-700">
          Impact Report
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[var(--bg-navy)]">
          We couldn&apos;t build the environmental estimate yet.
        </h2>
        <p className="mt-4 text-lg leading-8 text-[var(--text-soft)]">
          {error ?? "Unable to load the impact report."}
        </p>
        <p className="mt-4 text-sm leading-7 text-[var(--text-soft)]">
          This usually means the nearby store step hasn&apos;t been completed yet or the
          emissions service is temporarily unavailable.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/recipes/${toRecipePathSegment(recipeId)}/stores`}
            className="cta cta-primary"
          >
            Return to map
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-6">
        <div className="card-surface bg-white p-8 md:p-10">
          <span className="eyebrow">Recipe Impact</span>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.03em] text-[var(--bg-navy)] md:text-5xl">
            {recipe.title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--text-soft)]">
            This environmental view combines Edamam&apos;s recipe-level carbon class
            with a separate estimate for the shopping trip to your nearest suggested store.
          </p>
          <div className="mt-8 rounded-[1.6rem] border border-[var(--line)] bg-[var(--bg-navy)] p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white/65">
              Overall Impact Score
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <p className="font-[family-name:var(--font-display)] text-6xl font-bold leading-none">
                {report.overallImpactScore ?? "N/A"}
              </p>
              <p className="pb-1 text-xl font-semibold text-white/82">
                {report.overallImpactLabel ?? "Unavailable"}
              </p>
            </div>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
              This app-owned score blends Edamam&apos;s recipe carbon class and the
              estimated shopping-trip emissions using a 70% recipe / 30% trip weighting.
            </p>
            {report.overallImpactScore === null ? (
              <p className="mt-3 text-sm leading-6 text-white/68">
                We need both a recipe carbon class and a trip estimate to calculate
                the combined score.
              </p>
            ) : null}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] bg-[var(--bg-cream)] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-soft)]">
                Edamam recipe carbon class
              </p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-5xl font-bold text-[var(--bg-navy)]">
                {report.recipeCarbonClass ?? "N/A"}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-[var(--bg-mint)] p-6 text-[var(--bg-navy)]">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[rgba(16,28,48,0.7)]">
                Estimated shopping-trip emissions
              </p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-5xl font-bold">
                {report.tripCarbonKg !== null ? `${report.tripCarbonKg.toFixed(2)} kg` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="card-surface bg-[var(--bg-navy)] p-8 text-white md:p-10">
          <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight">
            What the trip estimate covers
          </h3>
          <ul className="mt-6 space-y-3 text-base leading-7 text-white/78">
            <li>Estimated round trip to the nearest suggested store: {report.tripDistanceMiles.toFixed(2)} miles.</li>
            <li>Approximate kilometers used in the calculation: {tripDistanceKm?.toFixed(2) ?? "N/A"} km.</li>
            <li>Trip estimate calculated through Climatiq&apos;s general estimate endpoint using a generic passenger car factor.</li>
            <li>Selected destination for the estimate: {report.estimatedStoreName ?? "Nearest suggested store"}.</li>
          </ul>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="card-surface bg-white p-8 md:p-10">
          <span className="eyebrow">Carbon Class Guide</span>
          <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[var(--bg-navy)]">
            What Edamam&apos;s recipe carbon class means.
          </h3>
          <p className="mt-4 text-lg leading-8 text-[var(--text-soft)]">
            Edamam assigns a built-in recipe carbon footprint class based on estimated
            CO2e emissions per serving. It works like a report-card scale:
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "A+ = lowest emissions per serving",
              "A = very low emissions",
              "B = low emissions",
              "C = moderate emissions",
              "D = moderately high emissions",
              "E = high emissions",
              "F = very high emissions",
              "G = highest emissions per serving"
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.15rem] border border-slate-200 bg-[var(--bg-cream)] px-4 py-3 text-sm font-semibold leading-6 text-[var(--bg-navy)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="card-surface bg-[var(--bg-mint)] p-8 text-[var(--bg-navy)] md:p-10">
          <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight">
            Keep exploring this recipe.
          </h3>
          <p className="mt-4 text-lg leading-8 text-[rgba(16,28,48,0.82)]">
            You can jump back to the nearby store recommendations or return to your
            saved recipes to compare another dish.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/recipes/${toRecipePathSegment(recipeId)}/stores`}
              className="cta cta-subtle"
            >
              Return to map
            </Link>
            <Link
              href="/saved"
              className="cta cta-primary"
            >
              View saved recipes
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
