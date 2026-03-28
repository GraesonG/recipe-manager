'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Recipe, MealPrepItem, CombinedIngredient } from '@/types';

interface MealPrepContextType {
  items: MealPrepItem[];
  addRecipe: (recipe: Recipe) => void;
  removeRecipe: (recipeId: string) => void;
  updateServings: (recipeId: string, servings: number) => void;
  clearAll: () => void;
  isInMealPrep: (recipeId: string) => boolean;
  getCombinedIngredients: () => CombinedIngredient[];
  totalRecipes: number;
}

const MealPrepContext = createContext<MealPrepContextType | undefined>(undefined);

export function MealPrepProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MealPrepItem[]>([]);

  const addRecipe = useCallback((recipe: Recipe) => {
    setItems((prev) => {
      // Check if already exists
      if (prev.some((item) => item.recipeId === recipe.id)) {
        return prev;
      }
      return [
        ...prev,
        {
          recipeId: recipe.id,
          recipe,
          servings: recipe.servings, // Start with original servings
        },
      ];
    });
  }, []);

  const removeRecipe = useCallback((recipeId: string) => {
    setItems((prev) => prev.filter((item) => item.recipeId !== recipeId));
  }, []);

  const updateServings = useCallback((recipeId: string, servings: number) => {
    if (servings < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.recipeId === recipeId ? { ...item, servings } : item
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const isInMealPrep = useCallback(
    (recipeId: string) => {
      return items.some((item) => item.recipeId === recipeId);
    },
    [items]
  );

  const getCombinedIngredients = useCallback((): CombinedIngredient[] => {
    const ingredientMap = new Map<string, CombinedIngredient>();

    items.forEach((item) => {
      const servingsMultiplier = item.servings / item.recipe.servings;

      item.recipe.ingredients.forEach((ingredient) => {
        // Create a key based on ingredient name and unit (normalized)
        const normalizedName = ingredient.name.toLowerCase().trim();
        const normalizedUnit = ingredient.unit.toLowerCase().trim();
        const key = `${normalizedName}|${normalizedUnit}`;

        // Parse quantity as number (handle fractions and ranges)
        let quantity = parseQuantity(ingredient.quantity);
        const scaledQuantity = quantity * servingsMultiplier;

        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          existing.totalQuantity += scaledQuantity;
          existing.originalQuantities.push({
            recipeId: item.recipeId,
            recipeName: item.recipe.name,
            quantity: scaledQuantity,
            servingsMultiplier,
          });
        } else {
          ingredientMap.set(key, {
            name: ingredient.name,
            unit: ingredient.unit,
            totalQuantity: scaledQuantity,
            originalQuantities: [
              {
                recipeId: item.recipeId,
                recipeName: item.recipe.name,
                quantity: scaledQuantity,
                servingsMultiplier,
              },
            ],
          });
        }
      });
    });

    // Convert map to array and sort alphabetically
    return Array.from(ingredientMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [items]);

  return (
    <MealPrepContext.Provider
      value={{
        items,
        addRecipe,
        removeRecipe,
        updateServings,
        clearAll,
        isInMealPrep,
        getCombinedIngredients,
        totalRecipes: items.length,
      }}
    >
      {children}
    </MealPrepContext.Provider>
  );
}

export function useMealPrep() {
  const context = useContext(MealPrepContext);
  if (context === undefined) {
    throw new Error('useMealPrep must be used within a MealPrepProvider');
  }
  return context;
}

/**
 * Parse a quantity string to a number
 * Handles: "2", "1.5", "1/2", "1 1/2", etc.
 */
function parseQuantity(quantity: string): number {
  if (!quantity || quantity.trim() === '') return 0;

  const trimmed = quantity.trim();

  // Try direct number parse first
  const direct = parseFloat(trimmed);
  if (!isNaN(direct) && !trimmed.includes('/')) {
    return direct;
  }

  // Handle fractions like "1/2"
  if (trimmed.includes('/')) {
    const parts = trimmed.split(' ');
    let total = 0;

    parts.forEach((part) => {
      if (part.includes('/')) {
        const [num, denom] = part.split('/').map((n) => parseFloat(n.trim()));
        if (!isNaN(num) && !isNaN(denom) && denom !== 0) {
          total += num / denom;
        }
      } else {
        const num = parseFloat(part);
        if (!isNaN(num)) {
          total += num;
        }
      }
    });

    return total;
  }

  return direct || 0;
}

/**
 * Format a quantity number back to a readable string
 */
export function formatQuantity(quantity: number): string {
  if (quantity === 0) return '';
  
  // Round to 2 decimal places
  const rounded = Math.round(quantity * 100) / 100;
  
  // If it's a whole number, return as integer
  if (rounded === Math.floor(rounded)) {
    return rounded.toString();
  }
  
  // Common fractions
  const fractions: [number, string][] = [
    [0.25, '¼'],
    [0.33, '⅓'],
    [0.5, '½'],
    [0.67, '⅔'],
    [0.75, '¾'],
  ];
  
  const wholePart = Math.floor(rounded);
  const decimalPart = rounded - wholePart;
  
  // Check if decimal part matches a common fraction
  for (const [value, symbol] of fractions) {
    if (Math.abs(decimalPart - value) < 0.05) {
      return wholePart > 0 ? `${wholePart} ${symbol}` : symbol;
    }
  }
  
  // Otherwise return decimal
  return rounded.toFixed(2).replace(/\.?0+$/, '');
}
