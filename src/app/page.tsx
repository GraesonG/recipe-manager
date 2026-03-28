'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Recipe, SortOption } from '@/types';
import { fetchRecipes } from '@/lib/api';
import { RecipeToolbar, RecipeGrid, LoadingGrid } from '@/components';

export default function HomePage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('a-z');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recipes on mount
  useEffect(() => {
    async function loadRecipes() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchRecipes();
        setRecipes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recipes');
      } finally {
        setIsLoading(false);
      }
    }

    loadRecipes();
  }, []);

  const handleAddRecipe = () => {
    router.push('/recipes/new');
  };

  const handleRecipeClick = (recipe: Recipe) => {
    router.push(`/recipes/${recipe.id}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-apple-label mb-2">
          Your Recipes
        </h1>
        <p className="text-apple-label-secondary">
          Browse, manage, and add recipes to your meal prep list.
        </p>
      </div>

      {/* Toolbar */}
      <RecipeToolbar
        sortBy={sortBy}
        onSortChange={setSortBy}
        onAddRecipe={handleAddRecipe}
        recipeCount={recipes.length}
      />

      {/* Error State */}
      {error && (
        <div className="glass-panel p-4 mb-6 border-apple-red/30 bg-apple-red/10">
          <p className="text-apple-red">{error}</p>
        </div>
      )}

      {/* Recipe Grid */}
      {isLoading ? (
        <LoadingGrid />
      ) : (
        <RecipeGrid
          recipes={recipes}
          sortBy={sortBy}
          onRecipeClick={handleRecipeClick}
        />
      )}
    </div>
  );
}
