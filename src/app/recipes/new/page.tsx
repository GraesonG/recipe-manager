import Link from 'next/link';
import { RecipeForm } from '@/components';

export default function NewRecipePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
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
          Add New Recipe
        </h1>
        <p className="text-apple-label-secondary mt-1">
          Fill in the details below to create a new recipe.
        </p>
      </div>

      {/* Recipe Form */}
      <RecipeForm mode="create" />
    </div>
  );
}
