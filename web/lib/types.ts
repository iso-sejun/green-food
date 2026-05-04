export type RecipeIngredient = {
  id: string;
  text: string;
  food: string;
  quantity: number | null;
  measure: string | null;
  weight: number | null;
  category: string | null;
};

export type Recipe = {
  id: string;
  uri: string;
  title: string;
  image: string | null;
  source: string;
  sourceUrl: string;
  cuisineLabels: string[];
  dietLabels: string[];
  healthLabels: string[];
  mealType: string[];
  dishType: string[];
  totalTime: number | null;
  servings: number | null;
  calories: number | null;
  ingredientLines: string[];
  ingredients: RecipeIngredient[];
  co2EmissionsClass: string | null;
  summary: string;
  labels: string[];
};

export type RecipeSearchResponse = {
  query: string;
  total: number;
  from: number;
  to: number;
  nextPage: string | null;
  recipes: Recipe[];
};
