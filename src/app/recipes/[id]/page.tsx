'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Recipe } from '@/types';
import { fetchRecipe, deleteRecipe } from '@/lib/api';
import { useMealPrep } from '@/lib/meal-prep-context';
import { LoadingSpinner } from '@/components';
import { GlassPanel, Button } from '@/components/ui';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { addRecipe, removeRecipe, isInMealPrep } = useMealPrep();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const inMealPrep = recipe ? isInMealPrep(recipe.id) : false;

  useEffect(() => {
    async function loadRecipe() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchRecipe(id);
        setRecipe(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recipe');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadRecipe();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!recipe) return;

    setIsDeleting(true);
    try {
      await deleteRecipe(recipe.id);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleToggleMealPrep = () => {
    if (!recipe) return;

    if (inMealPrep) {
      removeRecipe(recipe.id);
    } else {
      addRecipe(recipe);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
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
        </div>
        <GlassPanel className="p-12 flex items-center justify-center">
          <LoadingSpinner />
        </GlassPanel>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
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
          <h1 className="text-3xl font-semibold text-apple-label">Recipe Not Found</h1>
        </div>
        <GlassPanel className="p-8 text-center border-apple-red/30 bg-apple-red/10">
          <p className="text-apple-red mb-4">{error || 'Recipe not found'}</p>
          <Link href="/">
            <Button variant="primary">Back to Recipes</Button>
          </Link>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href="/"
          className="text-apple-blue hover:text-apple-blue/80 text-sm inline-flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Recipes
        </Link>
      </div>

      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-apple-label mb-2">
            {recipe.name}
          </h1>
          <div className="flex items-center gap-4 text-apple-label-secondary">
            <span className="flex items-center gap-1.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {recipe.servings} servings
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
              {recipe.ingredients.length} ingredients
            </span>
          </div>
          {inMealPrep && (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-apple-green/20 text-apple-green text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                In Meal Prep
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant={inMealPrep ? 'default' : 'primary'}
            onClick={handleToggleMealPrep}
          >
            <span className="flex items-center gap-1.5">
              {inMealPrep ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  In Meal Prep
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add to Meal Prep
                </>
              )}
            </span>
          </Button>
          <Link href={`/recipes/${recipe.id}/edit`}>
            <Button variant="default">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </span>
            </Button>
          </Link>
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </span>
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />

          {/* Modal */}
          <GlassPanel variant="elevated" className="relative z-10 p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-apple-label mb-2">
              Delete Recipe?
            </h3>
            <p className="text-apple-label-secondary mb-6">
              Are you sure you want to delete "{recipe.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  'Delete Recipe'
                )}
              </Button>
            </div>
          </GlassPanel>
        </div>
      )}

      {/* Cooking Information */}
      {recipe.cookingInfo.length > 0 && (
        <GlassPanel className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-apple-label mb-4">
            Cooking Information
          </h2>
          <div className="flex flex-wrap gap-3">
            {recipe.cookingInfo.map((info, index) => (
              <div
                key={info.id || index}
                className="glass-panel-subtle px-4 py-3 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-1">
                  {info.time && (
                    <span className="text-apple-label font-medium">{info.time}</span>
                  )}
                  {info.time && info.temp && (
                    <span className="text-apple-label-tertiary">@</span>
                  )}
                  {info.temp && (
                    <span className="text-apple-orange font-medium">{info.temp}</span>
                  )}
                </div>
                {info.description && (
                  <span className="text-sm text-apple-label-secondary">
                    {info.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingredients */}
        <div className="lg:col-span-1">
          <GlassPanel className="p-6 h-full">
            <h2 className="text-xl font-semibold text-apple-label mb-4">
              Ingredients
            </h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li
                  key={ingredient.id || index}
                  className="flex items-start gap-3 text-apple-label-secondary"
                >
                  <span className="w-2 h-2 rounded-full bg-apple-blue mt-2 flex-shrink-0" />
                  <span>
                    {ingredient.quantity && (
                      <span className="text-apple-label font-medium">
                        {ingredient.quantity}
                      </span>
                    )}{' '}
                    {ingredient.unit && (
                      <span className="text-apple-label-secondary">
                        {ingredient.unit}
                      </span>
                    )}{' '}
                    <span className="text-apple-label">{ingredient.name}</span>
                  </span>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>

        {/* Instructions */}
        <div className="lg:col-span-2">
          <GlassPanel className="p-6 h-full">
            <h2 className="text-xl font-semibold text-apple-label mb-4">
              Instructions
            </h2>
            <ol className="space-y-4">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-apple-blue/20 text-apple-blue flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-apple-label-secondary pt-1 leading-relaxed">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </GlassPanel>
        </div>
      </div>

      {/* Metadata Footer */}
      <div className="mt-8 pt-6 border-t border-glass-border">
        <div className="flex items-center justify-between text-sm text-apple-label-tertiary">
          <span>
            Created: {new Date(recipe.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {recipe.updatedAt !== recipe.createdAt && (
            <span>
              Updated: {new Date(recipe.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
