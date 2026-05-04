import { Router } from "express";
import { impactRouter } from "./impact.js";
import { mapsRouter } from "./maps.js";
import { recipesRouter } from "./recipes.js";

export const router = Router();

router.get("/status", (_request, response) => {
  response.json({
    api: "ready",
    integrations: {
      edamam: process.env.EDAMAM_APP_ID ? "configured" : "pending credentials",
      googleMaps: process.env.GOOGLE_MAPS_API_KEY ? "configured" : "pending credentials",
      climatiq: process.env.CLIMATIQ_API_KEY ? "configured" : "pending credentials"
    }
  });
});

router.use("/recipes", recipesRouter);
router.use("/maps", mapsRouter);
router.use("/impact", impactRouter);
