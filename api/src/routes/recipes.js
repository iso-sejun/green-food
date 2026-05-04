import { Router } from "express";
import { HttpError } from "../lib/http-error.js";
import {
  getRecipeById,
  searchRecipes,
  searchRecipesNextPage
} from "../services/edamam.js";

export const recipesRouter = Router();

recipesRouter.get("/search", async (request, response, next) => {
  try {
    const query = typeof request.query.q === "string" ? request.query.q : "";
    const nextPage =
      typeof request.query.nextPage === "string" ? request.query.nextPage : "";
    const result = nextPage
      ? await searchRecipesNextPage(nextPage, query)
      : await searchRecipes(query);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

recipesRouter.get("/:id", async (request, response, next) => {
  try {
    const recipe = await getRecipeById(request.params.id);
    response.json(recipe);
  } catch (error) {
    next(error);
  }
});

recipesRouter.use((error, _request, response, next) => {
  if (!(error instanceof HttpError)) {
    return next(error);
  }

  return response.status(error.status).json({
    error: error.message,
    details: error.details ?? null
  });
});
