'use client';

import { MealPrepItem } from '@/types';
import { useMealPrep } from '@/lib/meal-prep-context';
import { GlassPanel, Button } from '@/components/ui';

interface MealPrepRecipeCardProps {
  item: MealPrepItem;
}

export function MealPrepRecipeCard({ item }: MealPrepRecipeCardProps) {
  const { updateServings, removeRecipe } = useMealPrep();
  const { recipe, servings } = item;

  const handleDecrement = () => {
    if (servings > 1) {
      updateServings(recipe.id, servings - 1);
    }
  };

  const handleIncrement = () => {
    updateServings(recipe.id, servings + 1);
  };

  const scaleFactor = servings / recipe.servings;
  const isScaled = scaleFactor !== 1;

  return (
    <GlassPanel className="p-5">
      <div className="flex items-start justify-between gap-4">
        {/* Recipe Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-apple-label truncate">
            {recipe.name}
          </h3>
          <p className="text-sm text-apple-label-secondary mt-1">
            {recipe.ingredients.length} ingredients • {recipe.steps.length} steps
          </p>
          {isScaled && (
            <p className="text-xs text-apple-blue mt-1">
              Scaled {scaleFactor > 1 ? 'up' : 'down'} {scaleFactor.toFixed(1)}x from original
            </p>
          )}
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeRecipe(recipe.id)}
          className="text-apple-label-tertiary hover:text-apple-red flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
      </div>

      {/* Servings Adjuster */}
      <div className="mt-4 pt-4 border-t border-glass-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-apple-label-secondary">Servings</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDecrement}
              disabled={servings <= 1}
              className="w-8 h-8 rounded-full bg-glass-bg border border-glass-border flex items-center justify-center text-apple-label hover:bg-glass-bg-hover hover:border-glass-border-bright disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="w-12 text-center text-lg font-semibold text-apple-label">
              {servings}
            </span>
            <button
              onClick={handleIncrement}
              className="w-8 h-8 rounded-full bg-glass-bg border border-glass-border flex items-center justify-center text-apple-label hover:bg-glass-bg-hover hover:border-glass-border-bright transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-xs text-apple-label-tertiary mt-2 text-right">
          Original: {recipe.servings} servings
        </p>
      </div>
    </GlassPanel>
  );
}
