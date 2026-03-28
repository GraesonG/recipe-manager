import { NextRequest, NextResponse } from 'next/server';
import { readRecipes, createRecipe } from '@/lib/recipes';
import { createRecipeFromInput, validateRecipeInput } from '@/lib/utils';
import { RecipeInput, ApiResponse, Recipe } from '@/types';

/**
 * GET /api/recipes
 * Fetch all recipes
 */
export async function GET() {
  try {
    const recipes = await readRecipes();
    
    const response: ApiResponse<Recipe[]> = {
      success: true,
      data: recipes,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch recipes',
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/recipes
 * Create a new recipe
 */
export async function POST(request: NextRequest) {
  try {
    const body: RecipeInput = await request.json();
    
    // Validate input
    const errors = validateRecipeInput(body);
    if (errors.length > 0) {
      const response: ApiResponse<never> = {
        success: false,
        error: errors.join(', '),
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    // Create the recipe
    const newRecipe = createRecipeFromInput(body);
    await createRecipe(newRecipe);
    
    const response: ApiResponse<Recipe> = {
      success: true,
      data: newRecipe,
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating recipe:', error);
    
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to create recipe',
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
