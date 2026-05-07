"use client";

import { useEffect, useState } from "react";
import { getSavedLocation, SavedLocation } from "@/lib/local-storage";

export function LocationBadge() {
  const [location, setLocation] = useState<SavedLocation | null>(null);

  useEffect(() => {
    function syncLocation() {
      setLocation(getSavedLocation());
    }

    syncLocation();
    window.addEventListener("storage", syncLocation);
    window.addEventListener("root-and-recepie:location-updated", syncLocation);

    return () => {
      window.removeEventListener("storage", syncLocation);
      window.removeEventListener("root-and-recepie:location-updated", syncLocation);
    };
  }, []);

  if (!location) {
    return null;
  }

  return (
    <div className="hidden rounded-full border border-[rgba(16,28,48,0.14)] bg-white/60 px-4 py-2 text-sm font-semibold text-[var(--text-soft)] md:block">
      {location.label}
      {location.addressLine2 ? ` · ${location.addressLine2}` : ""}
    </div>
  );
}
