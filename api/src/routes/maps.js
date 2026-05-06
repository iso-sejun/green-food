import { Router } from "express";
import { HttpError } from "../lib/http-error.js";
import { geocodeAddress, searchNearbyStores } from "../services/google-maps.js";

export const mapsRouter = Router();

mapsRouter.post("/geocode", async (request, response, next) => {
  try {
    const { address } = request.body ?? {};
    const result = await geocodeAddress(address);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

mapsRouter.post("/nearby-stores", async (request, response, next) => {
  try {
    const { latitude, longitude, ingredientNames, ingredientCategories } = request.body ?? {};
    const stores = await searchNearbyStores({
      latitude,
      longitude,
      ingredientNames,
      ingredientCategories
    });
    response.json({ stores });
  } catch (error) {
    next(error);
  }
});

mapsRouter.use((error, _request, response, next) => {
  if (!(error instanceof HttpError)) {
    return next(error);
  }

  return response.status(error.status).json({
    error: error.message,
    details: error.details ?? null
  });
});
