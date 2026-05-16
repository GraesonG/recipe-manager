'use client';

import { Recipe } from '@/types';
import { Card } from '@/components/ui';

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  // Calculate total cook time (simplified - just count cooking steps)
  const cookingSteps = recipe.cookingInfo.length;
  const totalIngredients = recipe.ingredients.length;

  return (
    <Card onClick={onClick} className="group">
      {/* Recipe Name */}
      <h3 className="text-lg font-semibold text-apple-label mb-2 group-hover:text-apple-blue transition-colors">
        {recipe.name}
      </h3>

      {/* Quick Info */}
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-apple-label-secondary mb-4">
        <span className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {recipe.servings} servings
        </span>
        <span className="text-apple-separator">•</span>
        <span className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          {totalIngredients} ingredients
        </span>
      </div>

      {/* Cooking Info Preview */}
      {cookingSteps > 0 && (
        <div className="flex flex-wrap gap-2">
          {recipe.cookingInfo.slice(0, 2).map((info, index) => (
            <span
              key={info.id || index}
              className="px-2.5 py-1 text-xs rounded-full bg-apple-gray-5/50 text-apple-label-secondary border border-glass-border"
            >
              {info.time} {info.temp && `@ ${info.temp}`}
            </span>
          ))}
          {cookingSteps > 2 && (
            <span className="px-2.5 py-1 text-xs rounded-full bg-apple-gray-5/50 text-apple-label-tertiary border border-glass-border">
              +{cookingSteps - 2} more
            </span>
          )}
        </div>
      )}

      {/* Steps count */}
      <div className="mt-4 pt-3 border-t border-glass-border">
        <span className="text-xs text-apple-label-tertiary">
          {recipe.steps.length} steps
        </span>
      </div>
    </Card>
  );
}
