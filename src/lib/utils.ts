import { v4 as uuidv4 } from 'uuid';
import { 
  Recipe, 
  RecipeInput, 
  Ingredient, 
  CookingInfo,
  IngredientInput,
  CookingInfoInput 
} from '@/types';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Convert IngredientInput to Ingredient (adds ID)
 */
export function createIngredient(input: IngredientInput): Ingredient {
  return {
    id: generateId(),
    name: input.name.trim(),
    quantity: input.quantity.trim(),
    unit: input.unit.trim(),
    isPantryStaple: input.isPantryStaple ?? false,
  };
}

/**
 * Convert CookingInfoInput to CookingInfo (adds ID)
 */
export function createCookingInfo(input: CookingInfoInput): CookingInfo {
  return {
    id: generateId(),
    time: input.time.trim(),
    temp: input.temp.trim(),
    description: input.description.trim(),
  };
}

/**
 * Convert RecipeInput to Recipe (adds IDs and timestamps)
 */
export function createRecipeFromInput(input: RecipeInput): Recipe {
  const now = new Date().toISOString();
  
  return {
    id: generateId(),
    name: input.name.trim(),
    servings: input.servings,
    ingredients: input.ingredients.map(createIngredient),
    cookingInfo: input.cookingInfo.map(createCookingInfo),
    steps: input.steps.map((step) => step.trim()).filter((step) => step.length > 0),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update a recipe from input (preserves ID and createdAt)
 */
export function updateRecipeFromInput(
  existingRecipe: Recipe,
  input: RecipeInput
): Recipe {
  return {
    ...existingRecipe,
    name: input.name.trim(),
    servings: input.servings,
    ingredients: input.ingredients.map(createIngredient),
    cookingInfo: input.cookingInfo.map(createCookingInfo),
    steps: input.steps.map((step) => step.trim()).filter((step) => step.length > 0),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Validate a recipe input
 */
export function validateRecipeInput(input: RecipeInput): string[] {
  const errors: string[] = [];
  
  if (!input.name || input.name.trim().length === 0) {
    errors.push('Recipe name is required');
  }
  
  if (!input.servings || input.servings < 1) {
    errors.push('Servings must be at least 1');
  }
  
  if (!input.ingredients || input.ingredients.length === 0) {
    errors.push('At least one ingredient is required');
  } else {
    input.ingredients.forEach((ing, index) => {
      if (!ing.name || ing.name.trim().length === 0) {
        errors.push(`Ingredient ${index + 1}: Name is required`);
      }
    });
  }
  
  if (!input.steps || input.steps.length === 0) {
    errors.push('At least one step is required');
  } else {
    const nonEmptySteps = input.steps.filter((step) => step.trim().length > 0);
    if (nonEmptySteps.length === 0) {
      errors.push('At least one non-empty step is required');
    }
  }
  
  return errors;
}

/**
 * Create an empty recipe input for forms
 */
export function createEmptyRecipeInput(): RecipeInput {
  return {
    name: '',
    servings: 4,
    ingredients: [{ name: '', quantity: '', unit: '', isPantryStaple: false }],
    cookingInfo: [{ time: '', temp: '', description: '' }],
    steps: [''],
  };
}

/**
 * Convert a Recipe to RecipeInput for editing
 */
export function recipeToInput(recipe: Recipe): RecipeInput {
  return {
    name: recipe.name,
    servings: recipe.servings,
    ingredients: recipe.ingredients.map(({ name, quantity, unit, isPantryStaple }) => ({
      name,
      quantity,
      unit,
      isPantryStaple: isPantryStaple ?? false,
    })),
    cookingInfo: recipe.cookingInfo.map(({ time, temp, description }) => ({
      time,
      temp,
      description,
    })),
    steps: recipe.steps.length > 0 ? recipe.steps : [''],
  };
}
