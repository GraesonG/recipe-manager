import { Recipe, RecipeInput, ApiResponse } from '@/types';

const API_BASE = '/api/recipes';

/**
 * Fetch all recipes
 */
export async function fetchRecipes(): Promise<Recipe[]> {
  const response = await fetch(API_BASE);
  const data: ApiResponse<Recipe[]> = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch recipes');
  }
  
  return data.data || [];
}

/**
 * Fetch a single recipe by ID
 */
export async function fetchRecipe(id: string): Promise<Recipe> {
  const response = await fetch(`${API_BASE}/${id}`);
  const data: ApiResponse<Recipe> = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch recipe');
  }
  
  return data.data!;
}

/**
 * Create a new recipe
 */
export async function createRecipe(input: RecipeInput): Promise<Recipe> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  
  const data: ApiResponse<Recipe> = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create recipe');
  }
  
  return data.data!;
}

/**
 * Update an existing recipe
 */
export async function updateRecipe(id: string, input: RecipeInput): Promise<Recipe> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  
  const data: ApiResponse<Recipe> = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to update recipe');
  }
  
  return data.data!;
}

/**
 * Delete a recipe
 */
export async function deleteRecipe(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  
  const data: ApiResponse<{ deleted: boolean }> = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete recipe');
  }
}
