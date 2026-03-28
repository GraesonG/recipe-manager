import { NextRequest, NextResponse } from 'next/server';
import { getRecipeById, updateRecipe, deleteRecipe } from '@/lib/recipes';
import { updateRecipeFromInput, validateRecipeInput } from '@/lib/utils';
import { RecipeInput, ApiResponse, Recipe } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/recipes/[id]
 * Fetch a single recipe by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const recipe = await getRecipeById(id);
    
    if (!recipe) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Recipe not found',
      };
      return NextResponse.json(response, { status: 404 });
    }
    
    const response: ApiResponse<Recipe> = {
      success: true,
      data: recipe,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch recipe',
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PUT /api/recipes/[id]
 * Update a recipe
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: RecipeInput = await request.json();
    
    // Check if recipe exists
    const existingRecipe = await getRecipeById(id);
    if (!existingRecipe) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Recipe not found',
      };
      return NextResponse.json(response, { status: 404 });
    }
    
    // Validate input
    const errors = validateRecipeInput(body);
    if (errors.length > 0) {
      const response: ApiResponse<never> = {
        success: false,
        error: errors.join(', '),
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    // Update the recipe
    const updatedRecipeData = updateRecipeFromInput(existingRecipe, body);
    const updatedRecipe = await updateRecipe(id, updatedRecipeData);
    
    const response: ApiResponse<Recipe> = {
      success: true,
      data: updatedRecipe!,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating recipe:', error);
    
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to update recipe',
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * DELETE /api/recipes/[id]
 * Delete a recipe
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteRecipe(id);
    
    if (!deleted) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Recipe not found',
      };
      return NextResponse.json(response, { status: 404 });
    }
    
    const response: ApiResponse<{ deleted: boolean }> = {
      success: true,
      data: { deleted: true },
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting recipe:', error);
    
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to delete recipe',
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
