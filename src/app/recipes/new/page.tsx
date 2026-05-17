'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RecipeInput } from '@/types';
import { RecipeForm, PREVIEW_STORAGE_KEY } from '@/components';

export default function NewRecipePage() {
  const [initialData, setInitialData] = useState<RecipeInput | undefined>(undefined);
  const [imported, setImported] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(PREVIEW_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as RecipeInput;
        setInitialData(parsed);
        setImported(true);
        window.sessionStorage.removeItem(PREVIEW_STORAGE_KEY);
      }
    } catch {
      // ignore — show empty form
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
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
          {imported ? 'Review Imported Recipe' : 'Add New Recipe'}
        </h1>
        <p className="text-apple-label-secondary mt-1">
          {imported
            ? 'Edit anything that looks off, then save.'
            : 'Fill in the details below to create a new recipe.'}
        </p>
      </div>

      <RecipeForm mode="create" initialData={initialData} />
    </div>
  );
}
