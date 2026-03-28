import { promises as fs } from 'fs';
import path from 'path';
import { Recipe, RecipesResponse } from '@/types';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'recipes.json');

/**
 * Read all recipes from the JSON file
 */
export async function readRecipes(): Promise<Recipe[]> {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const data: RecipesResponse = JSON.parse(fileContent);
    return data.recipes || [];
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    console.error('Error reading recipes:', error);
    return [];
  }
}

/**
 * Write recipes to the JSON file
 */
export async function writeRecipes(recipes: Recipe[]): Promise<void> {
  const data: RecipesResponse = { recipes };
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Get a single recipe by ID
 */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  const recipes = await readRecipes();
  return recipes.find((recipe) => recipe.id === id) || null;
}

/**
 * Create a new recipe
 */
export async function createRecipe(recipe: Recipe): Promise<Recipe> {
  const recipes = await readRecipes();
  recipes.push(recipe);
  await writeRecipes(recipes);
  return recipe;
}

/**
 * Update an existing recipe
 */
export async function updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe | null> {
  const recipes = await readRecipes();
  const index = recipes.findIndex((recipe) => recipe.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedRecipe: Recipe = {
    ...recipes[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  recipes[index] = updatedRecipe;
  await writeRecipes(recipes);
  return updatedRecipe;
}

/**
 * Delete a recipe by ID
 */
export async function deleteRecipe(id: string): Promise<boolean> {
  const recipes = await readRecipes();
  const index = recipes.findIndex((recipe) => recipe.id === id);
  
  if (index === -1) {
    return false;
  }
  
  recipes.splice(index, 1);
  await writeRecipes(recipes);
  return true;
}

/**
 * Check if a recipe exists
 */
export async function recipeExists(id: string): Promise<boolean> {
  const recipes = await readRecipes();
  return recipes.some((recipe) => recipe.id === id);
}
