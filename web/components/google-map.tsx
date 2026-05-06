"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: typeof google;
  }
}

type MarkerLike = {
  name: string;
  latitude: number;
  longitude: number;
};

type GoogleMapProps = {
  apiKey: string;
  center: {
    latitude: number;
    longitude: number;
  };
  userLabel: string;
  markers: MarkerLike[];
};

function loadGoogleMaps(apiKey: string) {
  const existing = document.getElementById("google-maps-script");

  if (existing) {
    return new Promise<void>((resolve) => {
      if (window.google?.maps) {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });
}

export function GoogleMap({
  apiKey,
  center,
  userLabel,
  markers
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey || !mapRef.current) {
      setError("Google Maps API key is unavailable for the browser map.");
      return;
    }

    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !mapRef.current || !window.google?.maps) {
          return;
        }

        const googleMaps = window.google.maps;
        const map = new googleMaps.Map(mapRef.current, {
          center: {
            lat: center.latitude,
            lng: center.longitude
          },
          zoom: 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });

        new googleMaps.Marker({
          map,
          position: { lat: center.latitude, lng: center.longitude },
          title: userLabel,
          label: "U"
        });

        markers.forEach((marker, index) => {
          new googleMaps.Marker({
            map,
            position: { lat: marker.latitude, lng: marker.longitude },
            title: marker.name,
            label: String(index + 1)
          });
        });
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load Google Maps."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, center.latitude, center.longitude, markers, userLabel]);

  if (error) {
    return (
      <div className="card-surface flex min-h-[420px] items-center justify-center bg-white p-8">
        <div className="max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-soft)]">
            Map Unavailable
          </p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[var(--bg-navy)]">
            We couldn&apos;t load the interactive map right now.
          </p>
          <p className="mt-4 text-lg leading-8 text-[var(--text-soft)]">
            {error}
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--text-soft)]">
            The store list below should still work, so you can continue the flow even
            if the map service is temporarily unavailable.
          </p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="card-surface min-h-[420px] overflow-hidden" />;
}
