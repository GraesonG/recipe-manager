'use client';

import { MealPrepItem } from '@/types';
import { useMealPrep } from '@/lib/meal-prep-context';
import { GlassPanel } from '@/components/ui';

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

        {/* Pin / Unpin Button — recipe is pinned to the plan; click to remove */}
        <button
          type="button"
          onClick={() => removeRecipe(recipe.id)}
          aria-label={`Unpin ${recipe.name} from meal prep`}
          title="Unpin from meal prep"
          className="group/pin flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-apple-blue hover:text-apple-red hover:bg-apple-red/10 transition-colors"
        >
          <svg
            className="w-5 h-5 transition-transform group-hover/pin:rotate-45"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M14.5 2.5a1 1 0 011 1V8l2.6 2.6a1 1 0 01.3.7v.7a1 1 0 01-1 1H13v6.5a1 1 0 01-2 0V13H6.6a1 1 0 01-1-1v-.7a1 1 0 01.3-.7L8.5 8V3.5a1 1 0 011-1h5z" />
          </svg>
        </button>
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
