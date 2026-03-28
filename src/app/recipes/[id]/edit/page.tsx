'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Recipe, RecipeInput } from '@/types';
import { fetchRecipe } from '@/lib/api';
import { recipeToInput } from '@/lib/utils';
import { RecipeForm, LoadingSpinner } from '@/components';
import { GlassPanel, Button } from '@/components/ui';

export default function EditRecipePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [initialData, setInitialData] = useState<RecipeInput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecipe() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchRecipe(id);
        setRecipe(data);
        setInitialData(recipeToInput(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recipe');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadRecipe();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link 
            href={`/recipes/${id}`} 
            className="text-apple-blue hover:text-apple-blue/80 text-sm mb-4 inline-flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Recipe
          </Link>
          <h1 className="text-3xl font-semibold text-apple-label">
            Edit Recipe
          </h1>
        </div>
        <GlassPanel className="p-12 flex items-center justify-center">
          <LoadingSpinner />
        </GlassPanel>
      </div>
    );
  }

  if (error || !recipe || !initialData) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-apple-blue hover:text-apple-blue/80 text-sm mb-4 inline-flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Recipes
          </Link>
          <h1 className="text-3xl font-semibold text-apple-label">
            Edit Recipe
          </h1>
        </div>
        <GlassPanel className="p-8 text-center border-apple-red/30 bg-apple-red/10">
          <p className="text-apple-red mb-4">{error || 'Recipe not found'}</p>
          <Link href="/">
            <Button variant="primary">Back to Recipes</Button>
          </Link>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <Link 
          href={`/recipes/${id}`} 
          className="text-apple-blue hover:text-apple-blue/80 text-sm mb-4 inline-flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Recipe
        </Link>
        <h1 className="text-3xl font-semibold text-apple-label">
          Edit Recipe
        </h1>
        <p className="text-apple-label-secondary mt-1">
          Editing: {recipe.name}
        </p>
      </div>

      {/* Recipe Form */}
      <RecipeForm 
        mode="edit" 
        recipeId={id} 
        initialData={initialData} 
      />
    </div>
  );
}
