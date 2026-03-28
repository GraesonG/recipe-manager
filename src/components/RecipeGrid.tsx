'use client';

import { Recipe, SortOption } from '@/types';
import { RecipeCard } from './RecipeCard';
import { GlassPanel } from '@/components/ui';

interface RecipeGridProps {
  recipes: Recipe[];
  sortBy: SortOption;
  onRecipeClick: (recipe: Recipe) => void;
}

/**
 * Sort recipes based on the selected sort option
 */
function sortRecipes(recipes: Recipe[], sortBy: SortOption): Recipe[] {
  const sorted = [...recipes];

  switch (sortBy) {
    case 'a-z':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'z-a':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'newest':
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'oldest':
      return sorted.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    default:
      return sorted;
  }
}

export function RecipeGrid({ recipes, sortBy, onRecipeClick }: RecipeGridProps) {
  const sortedRecipes = sortRecipes(recipes, sortBy);

  if (recipes.length === 0) {
    return (
      <GlassPanel className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          {/* Empty state icon */}
          <div className="w-16 h-16 rounded-full bg-apple-gray-5/50 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-apple-label-tertiary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>

          {/* Empty state text */}
          <div>
            <h3 className="text-lg font-medium text-apple-label mb-1">
              No recipes yet
            </h3>
            <p className="text-apple-label-secondary">
              Add your first recipe to get started with meal planning.
            </p>
          </div>
        </div>
      </GlassPanel>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedRecipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onClick={() => onRecipeClick(recipe)}
        />
      ))}
    </div>
  );
}
