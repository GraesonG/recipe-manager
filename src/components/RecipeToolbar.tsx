'use client';

import { useState } from 'react';
import { SortOption, SORT_OPTIONS } from '@/types';
import { Button, Toolbar, ToolbarSpacer } from '@/components/ui';
import { ImportUrlModal } from './ImportUrlModal';

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
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <Toolbar className="mb-6">
        <span className="text-sm text-apple-label-secondary px-2">
          {recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}
        </span>

        <ToolbarSpacer />

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

        <Button variant="ghost" size="sm" onClick={() => setImportOpen(true)}>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 015.656 0l1.415 1.415a4 4 0 010 5.656l-3.535 3.535a4 4 0 01-5.657 0l-1.415-1.415m1.415-9.171L8.172 13.828a4 4 0 000 5.657M10.172 13.828a4 4 0 010-5.656l3.535-3.535a4 4 0 015.657 0l1.415 1.415"
              />
            </svg>
            Import from URL
          </span>
        </Button>

        <Button variant="primary" size="sm" onClick={onAddRecipe}>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <ImportUrlModal open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}
