'use client';

import { useState } from 'react';
import { useMealPrep, formatQuantity } from '@/lib/meal-prep-context';
import { CombinedIngredient } from '@/types';
import { GlassPanel } from '@/components/ui';

export function CombinedIngredientsList() {
  const { getCombinedIngredients, items, isOverridden, togglePantryOverride } = useMealPrep();
  const [pantryOpen, setPantryOpen] = useState(false);

  if (items.length === 0) {
    return null;
  }

  const all = getCombinedIngredients();
  const shopping = all.filter((ing) => !ing.isPantryStaple || isOverridden(ing));
  const pantry = all.filter((ing) => ing.isPantryStaple && !isOverridden(ing));

  return (
    <GlassPanel className="p-6">
      <h2 className="text-xl font-semibold text-apple-label mb-1">
        Shopping List Preview
      </h2>
      <p className="text-sm text-apple-label-secondary mb-4">
        Combined from {items.length} recipe{items.length !== 1 ? 's' : ''}
        {pantry.length > 0 && ` • ${pantry.length} pantry item${pantry.length !== 1 ? 's' : ''} hidden`}
      </p>

      {shopping.length > 0 ? (
        <ul className="space-y-2">
          {shopping.map((ing) => (
            <ShoppingRow key={rowKey(ing)} ingredient={ing} />
          ))}
        </ul>
      ) : (
        <p className="text-apple-label-tertiary text-center py-4">
          Everything in this list is a pantry item.
        </p>
      )}

      {pantry.length > 0 && (
        <div className="mt-6 border-t border-glass-border pt-4">
          <button
            type="button"
            onClick={() => setPantryOpen((open) => !open)}
            className="w-full flex items-center justify-between text-sm text-apple-label-secondary hover:text-apple-label transition-colors"
            aria-expanded={pantryOpen}
          >
            <span>
              Pantry items ({pantry.length}) — not shopping
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${pantryOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {pantryOpen && (
            <ul className="mt-3 space-y-2">
              {pantry.map((ing) => (
                <PantryRow
                  key={rowKey(ing)}
                  ingredient={ing}
                  onOverride={() => togglePantryOverride(ing)}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </GlassPanel>
  );
}

function rowKey(ing: CombinedIngredient): string {
  return `${ing.name}|${ing.unit}`;
}

function ShoppingRow({ ingredient }: { ingredient: CombinedIngredient }) {
  const { isOverridden, togglePantryOverride } = useMealPrep();
  const overriddenStaple = ingredient.isPantryStaple && isOverridden(ingredient);

  return (
    <li className="flex items-start gap-3 py-2 border-b border-glass-border last:border-0">
      <div className="w-5 h-5 rounded border border-glass-border-bright bg-glass-bg flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-apple-label font-medium">
            {formatQuantity(ingredient.totalQuantity)}
          </span>
          {ingredient.unit && (
            <span className="text-apple-label-secondary">{ingredient.unit}</span>
          )}
          <span className="text-apple-label">{ingredient.name}</span>
          {overriddenStaple && (
            <button
              type="button"
              onClick={() => togglePantryOverride(ingredient)}
              className="ml-1 text-xs text-apple-blue hover:underline"
              title="Move back to pantry"
            >
              (pantry — undo)
            </button>
          )}
        </div>
        {ingredient.originalQuantities.length > 1 && (
          <p className="text-xs text-apple-label-tertiary mt-1">
            From: {ingredient.originalQuantities.map((oq) => oq.recipeName).join(', ')}
          </p>
        )}
      </div>
    </li>
  );
}

function PantryRow({
  ingredient,
  onOverride,
}: {
  ingredient: CombinedIngredient;
  onOverride: () => void;
}) {
  return (
    <li className="flex items-start gap-3 py-2 opacity-60">
      <label className="flex items-center cursor-pointer mt-0.5">
        <input
          type="checkbox"
          checked={false}
          onChange={onOverride}
          className="w-5 h-5 rounded border border-glass-border-bright bg-glass-bg cursor-pointer accent-apple-blue"
          aria-label={`Add ${ingredient.name} back to shopping list`}
        />
      </label>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-apple-label-secondary font-medium">
            {formatQuantity(ingredient.totalQuantity)}
          </span>
          {ingredient.unit && (
            <span className="text-apple-label-tertiary">{ingredient.unit}</span>
          )}
          <span className="text-apple-label-secondary">{ingredient.name}</span>
        </div>
      </div>
    </li>
  );
}
