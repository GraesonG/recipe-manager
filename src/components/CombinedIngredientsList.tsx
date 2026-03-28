'use client';

import { useMealPrep, formatQuantity } from '@/lib/meal-prep-context';
import { GlassPanel } from '@/components/ui';

export function CombinedIngredientsList() {
  const { getCombinedIngredients, items } = useMealPrep();
  const combinedIngredients = getCombinedIngredients();

  if (items.length === 0) {
    return null;
  }

  return (
    <GlassPanel className="p-6">
      <h2 className="text-xl font-semibold text-apple-label mb-4">
        Shopping List Preview
      </h2>
      <p className="text-sm text-apple-label-secondary mb-4">
        Combined and deduplicated ingredients from {items.length} recipe{items.length !== 1 ? 's' : ''}
      </p>

      <div className="space-y-2">
        {combinedIngredients.map((ingredient, index) => (
          <div
            key={`${ingredient.name}-${ingredient.unit}-${index}`}
            className="flex items-start gap-3 py-2 border-b border-glass-border last:border-0"
          >
            {/* Checkbox placeholder */}
            <div className="w-5 h-5 rounded border border-glass-border-bright bg-glass-bg flex-shrink-0 mt-0.5" />

            {/* Ingredient info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-apple-label font-medium">
                  {formatQuantity(ingredient.totalQuantity)}
                </span>
                {ingredient.unit && (
                  <span className="text-apple-label-secondary">
                    {ingredient.unit}
                  </span>
                )}
                <span className="text-apple-label">{ingredient.name}</span>
              </div>

              {/* Show which recipes this ingredient comes from */}
              {ingredient.originalQuantities.length > 1 && (
                <p className="text-xs text-apple-label-tertiary mt-1">
                  From:{' '}
                  {ingredient.originalQuantities
                    .map((oq) => oq.recipeName)
                    .join(', ')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {combinedIngredients.length === 0 && (
        <p className="text-apple-label-tertiary text-center py-4">
          No ingredients to show
        </p>
      )}
    </GlassPanel>
  );
}
