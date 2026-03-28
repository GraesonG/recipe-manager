'use client';

import { Recipe, SortOption, SORT_OPTIONS } from '@/types';
import { Select, Button, Toolbar, ToolbarSpacer } from '@/components/ui';

interface RecipeToolbarProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onAddRecipe: () => void;
  recipeCount: number;
}

export function RecipeToolbar({
  sortBy,
  onSortChange,
  onAddRecipe,
  recipeCount,
}: RecipeToolbarProps) {
  return (
    <Toolbar className="mb-6">
      {/* Recipe count */}
      <span className="text-sm text-apple-label-secondary px-2">
        {recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}
      </span>

      <ToolbarSpacer />

      {/* Sort dropdown */}
      <div className="flex items-center gap-2">
        <label htmlFor="sort-select" className="text-sm text-apple-label-secondary">
          Sort:
        </label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="glass-select py-1.5 px-3 text-sm min-w-[140px]"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Add Recipe Button */}
      <Button variant="primary" size="sm" onClick={onAddRecipe}>
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
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Recipe
        </span>
      </Button>
    </Toolbar>
  );
}
