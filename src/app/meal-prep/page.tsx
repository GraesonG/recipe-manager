'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMealPrep, formatQuantity } from '@/lib/meal-prep-context';
import { MealPrepRecipeCard, CombinedIngredientsList } from '@/components';
import { Button, GlassPanel } from '@/components/ui';

export default function MealPrepPage() {
  const { items, clearAll, getCombinedIngredients, isOverridden, isHydrated } = useMealPrep();
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Get current week's date range
  const getWeekDateRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    
    // Get Sunday of current week
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - dayOfWeek);
    
    // Get Saturday of current week
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    return `${formatDate(sunday)} - ${formatDate(saturday)}, ${saturday.getFullYear()}`;
  };

  const handleSendToGoogleKeep = async () => {
    setIsSending(true);
    setSendResult(null);

    try {
      const combinedIngredients = getCombinedIngredients();
      const shoppingIngredients = combinedIngredients.filter(
        (ing) => !ing.isPantryStaple || isOverridden(ing)
      );
      const weekRange = getWeekDateRange();

      // Get API key from environment variable
      const apiKey = process.env.NEXT_PUBLIC_GKEEP_API_KEY || '';

      const response = await fetch('/api/google-keep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          title: `Meal Prep - ${weekRange}`,
          ingredients: shoppingIngredients.map((ing) => ({
            name: ing.name,
            quantity: formatQuantity(ing.totalQuantity),
            unit: ing.unit,
          })),
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        setSendResult({
          success: false,
          message: data.error || 'Unauthorized. Check your API key configuration.',
        });
      } else if (data.success) {
        setSendResult({
          success: true,
          message: 'Shopping list sent to Google Keep!',
        });
      } else {
        setSendResult({
          success: false,
          message: data.error || 'Failed to send to Google Keep',
        });
      }
    } catch (error) {
      setSendResult({
        success: false,
        message: 'Failed to connect to Google Keep. Make sure the integration is set up.',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-apple-label mb-2">
            Meal Prep
          </h1>
        </div>
        <GlassPanel className="p-12 text-center text-apple-label-tertiary">
          Loading…
        </GlassPanel>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-apple-label mb-2">
            Meal Prep
          </h1>
          <p className="text-apple-label-secondary">
            Plan your meals and generate shopping lists for Google Keep.
          </p>
        </div>

        <GlassPanel className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            {/* Empty state icon */}
            <div className="w-20 h-20 rounded-full bg-apple-gray-5/50 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-apple-label-tertiary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>

            <div className="max-w-md">
              <h3 className="text-xl font-medium text-apple-label mb-2">
                No recipes in meal prep
              </h3>
              <p className="text-apple-label-secondary mb-6">
                Add recipes from your collection to start planning your meals for the week.
                Once added, you can adjust servings and send the combined shopping list to Google Keep.
              </p>
            </div>

            <Link href="/">
              <Button variant="primary" size="lg">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Browse Recipes
                </span>
              </Button>
            </Link>
          </div>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-apple-label mb-2">
            Meal Prep
          </h1>
          <p className="text-apple-label-secondary">
            Week of {getWeekDateRange()}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <Button variant="ghost" onClick={clearAll}>
            Clear All
          </Button>
          <Button
            variant="primary"
            onClick={handleSendToGoogleKeep}
            disabled={isSending}
          >
            {isSending ? (
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
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Send to Google Keep
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Result Message */}
      {sendResult && (
        <GlassPanel
          className={`p-4 mb-6 ${
            sendResult.success
              ? 'border-apple-green/30 bg-apple-green/10'
              : 'border-apple-red/30 bg-apple-red/10'
          }`}
        >
          <p className={sendResult.success ? 'text-apple-green' : 'text-apple-red'}>
            {sendResult.message}
          </p>
        </GlassPanel>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Selected Recipes */}
        <div>
          <h2 className="text-xl font-semibold text-apple-label mb-4">
            Selected Recipes ({items.length})
          </h2>
          <div className="space-y-4">
            {items.map((item) => (
              <MealPrepRecipeCard key={item.recipeId} item={item} />
            ))}
          </div>

          <div className="mt-4">
            <Link href="/">
              <Button variant="ghost" className="w-full">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add More Recipes
                </span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Right: Combined Ingredients */}
        <div>
          <CombinedIngredientsList />
        </div>
      </div>
    </div>
  );
}
