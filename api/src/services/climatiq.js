import { HttpError } from "../lib/http-error.js";
import { requireEnv } from "../lib/env.js";

const KM_PER_MILE = 1.609344;
const GENERIC_CAR_ACTIVITY_ID =
  "passenger_vehicle-vehicle_type_car-fuel_source_na-engine_size_na-vehicle_age_na-vehicle_weight_na";

function milesToKilometers(miles) {
  return miles * KM_PER_MILE;
}

export async function estimateCarTripEmissions(distanceMiles) {
  if (typeof distanceMiles !== "number" || Number.isNaN(distanceMiles) || distanceMiles <= 0) {
    throw new HttpError(400, "A positive trip distance is required");
  }

  const apiKey = requireEnv("CLIMATIQ_API_KEY");
  const response = await fetch("https://api.climatiq.io/data/v1/estimate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      emission_factor: {
        activity_id: GENERIC_CAR_ACTIVITY_ID,
        data_version: "^21"
      },
      parameters: {
        distance: milesToKilometers(distanceMiles),
        distance_unit: "km"
      }
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new HttpError(response.status, "Climatiq estimate failed", {
      provider: "climatiq",
      message
    });
  }

  const data = await response.json();

  return {
    co2eKg: data.co2e ?? null,
    co2eUnit: data.co2e_unit ?? "kg",
    activityId: data.emission_factor?.activity_id ?? GENERIC_CAR_ACTIVITY_ID,
    factorName: data.emission_factor?.name ?? "Car",
    factorRegion: data.emission_factor?.region ?? null,
    distanceKm: data.activity_data?.activity_value ?? milesToKilometers(distanceMiles)
  };
}

