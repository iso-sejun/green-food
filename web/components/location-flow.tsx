"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearSavedLocation,
  getSavedLocation,
  setSavedLocation,
  SavedLocation
} from "@/lib/local-storage";
import { toRecipePathSegment } from "@/lib/recipe-routing";

type LocationFlowProps = {
  recipeId?: string;
};

export function LocationFlow({ recipeId }: LocationFlowProps) {
  const router = useRouter();
  const [savedLocation, setSavedLocationState] = useState<SavedLocation | null>(null);
  const [address, setAddress] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const existing = getSavedLocation();
    setSavedLocationState(existing);
    setIsEditing(!existing);

    if (existing) {
      setAddress(existing.label);
      setAddressLine2(existing.addressLine2 ?? "");
    }
  }, []);

  function proceed() {
    if (recipeId) {
      router.push(`/recipes/${toRecipePathSegment(recipeId)}/ingredients`);
      return;
    }

    router.push("/recipes");
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedAddress = address.trim();
    const trimmedLine2 = addressLine2.trim();

    if (!trimmedAddress) {
      return;
    }

    const nextLocation = {
      label: trimmedAddress,
      addressLine2: trimmedLine2 || undefined
    };

    setSavedLocation(nextLocation);
    window.dispatchEvent(new Event("green-table:location-updated"));
    setSavedLocationState(nextLocation);
    setIsEditing(false);
    proceed();
  }

  function onClear() {
    clearSavedLocation();
    window.dispatchEvent(new Event("green-table:location-updated"));
    setSavedLocationState(null);
    setAddress("");
    setAddressLine2("");
    setIsEditing(true);
  }

  if (savedLocation && !isEditing) {
    return (
      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="card-surface bg-white p-8 md:p-10">
          <span className="eyebrow">Current Location</span>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.03em] text-[var(--bg-navy)] md:text-5xl">
            We already have a location on file.
          </h2>
          <div className="mt-8 rounded-[1.5rem] bg-[var(--bg-cream)] p-6">
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--bg-navy)]">
              {savedLocation.label}
            </p>
            {savedLocation.addressLine2 ? (
              <p className="mt-2 text-base leading-7 text-[var(--text-soft)]">
                {savedLocation.addressLine2}
              </p>
            ) : null}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={proceed}
              className="cta cta-primary"
            >
              Use this location
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="cta cta-secondary"
            >
              Update location
            </button>
          </div>
        </section>

        <aside className="card-surface bg-[var(--bg-mint)] p-8 text-[var(--bg-navy)] md:p-10">
          <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight">
            Why we ask for it
          </h3>
          <p className="mt-4 text-lg leading-8 text-[rgba(16,28,48,0.82)]">
            Your saved location will be used in the next step to search for nearby
            stores likely to carry the ingredients you still need.
          </p>
          <button
            type="button"
            onClick={onClear}
            className="cta cta-subtle mt-8"
          >
            Clear saved location
          </button>
        </aside>
      </div>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
      <form onSubmit={onSubmit} className="card-surface bg-white p-8 md:p-10">
        <span className="eyebrow">Set Location</span>
        <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.03em] text-[var(--bg-navy)] md:text-5xl">
          Add the location we should search around.
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--text-soft)]">
          We save this locally in your browser, then geocode it with Google Maps
          before looking for nearby grocery-oriented stores.
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="location-address"
              className="mb-2 block text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-soft)]"
            >
              Address or area
            </label>
            <input
              id="location-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Hanover, NH or 15 Main St, Hanover, NH"
              className="w-full rounded-[1.2rem] border border-slate-200 bg-[var(--bg-cream)] px-4 py-4 text-lg outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="location-line-2"
              className="mb-2 block text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-soft)]"
            >
              Optional note
            </label>
            <input
              id="location-line-2"
              value={addressLine2}
              onChange={(event) => setAddressLine2(event.target.value)}
              placeholder="Apartment, landmark, or short note"
              className="w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 text-lg outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="cta cta-primary mt-8"
        >
          Save and continue
        </button>
      </form>

      <aside className="card-surface bg-[var(--bg-navy)] p-8 text-white md:p-10">
        <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight">
          Next, we&apos;ll compare your checklist against nearby stores.
        </h3>
        <p className="mt-4 text-lg leading-8 text-white/75">
          Once your location is saved, we can move to the ingredient checklist and
          then the mapping step without asking for it again.
        </p>
        <ul className="mt-8 space-y-3 text-base leading-7 text-white/78">
          <li>Your location is stored locally in this browser for hackathon speed.</li>
          <li>The headbar will show the saved location after you continue.</li>
          <li>Google Maps geocoding and store discovery happen in the next step.</li>
        </ul>
      </aside>
    </div>
  );
}
