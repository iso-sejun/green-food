import { Router } from "express";
import { HttpError } from "../lib/http-error.js";
import { estimateCarTripEmissions } from "../services/climatiq.js";

export const impactRouter = Router();

impactRouter.post("/trip", async (request, response, next) => {
  try {
    const { distanceMiles } = request.body ?? {};
    const estimate = await estimateCarTripEmissions(distanceMiles);
    response.json(estimate);
  } catch (error) {
    next(error);
  }
});

impactRouter.use((error, _request, response, next) => {
  if (!(error instanceof HttpError)) {
    return next(error);
  }

  return response.status(error.status).json({
    error: error.message,
    details: error.details ?? null
  });
});

