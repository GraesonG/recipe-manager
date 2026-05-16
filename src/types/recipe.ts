// Recipe Types

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  isPantryStaple?: boolean;
}

export interface CookingInfo {
  id: string;
  time: string;
  temp: string;
  description: string;
}

export interface Recipe {
  id: string;
  name: string;
  servings: number;
  ingredients: Ingredient[];
  cookingInfo: CookingInfo[];
  steps: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RecipesResponse {
  recipes: Recipe[];
}

// Form Types (for creating/editing without IDs)
export interface IngredientInput {
  name: string;
  quantity: string;
  unit: string;
  isPantryStaple?: boolean;
}

export interface CookingInfoInput {
  time: string;
  temp: string;
  description: string;
}

export interface RecipeInput {
  name: string;
  servings: number;
  ingredients: IngredientInput[];
  cookingInfo: CookingInfoInput[];
  steps: string[];
}

// Sorting Types
export type SortOption = 'a-z' | 'z-a' | 'newest' | 'oldest';

export interface SortConfig {
  value: SortOption;
  label: string;
}

export const SORT_OPTIONS: SortConfig[] = [
  { value: 'a-z', label: 'A-Z' },
  { value: 'z-a', label: 'Z-A' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

// Meal Prep Types
export interface MealPrepItem {
  recipeId: string;
  recipe: Recipe;
  servings: number; // Adjusted servings for meal prep
}

export interface CombinedIngredient {
  name: string;
  unit: string;
  totalQuantity: number;
  isPantryStaple: boolean; // true only if every contributing ingredient is flagged
  originalQuantities: {
    recipeId: string;
    recipeName: string;
    quantity: number;
    servingsMultiplier: number;
  }[];
}
