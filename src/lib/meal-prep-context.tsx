'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Recipe, MealPrepItem, CombinedIngredient } from '@/types';
import { combineIngredients, combineKey } from './combine-ingredients';

interface MealPrepContextType {
  items: MealPrepItem[];
  addRecipe: (recipe: Recipe) => void;
  removeRecipe: (recipeId: string) => void;
  updateServings: (recipeId: string, servings: number) => void;
  clearAll: () => void;
  isInMealPrep: (recipeId: string) => boolean;
  getCombinedIngredients: () => CombinedIngredient[];
  totalRecipes: number;
  pantryOverrides: Set<string>;
  isOverridden: (combined: CombinedIngredient) => boolean;
  togglePantryOverride: (combined: CombinedIngredient) => void;
}

const MealPrepContext = createContext<MealPrepContextType | undefined>(undefined);

export function MealPrepProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MealPrepItem[]>([]);
  const [pantryOverrides, setPantryOverrides] = useState<Set<string>>(new Set());

  const addRecipe = useCallback((recipe: Recipe) => {
    setItems((prev) => {
      if (prev.some((item) => item.recipeId === recipe.id)) {
        return prev;
      }
      return [
        ...prev,
        {
          recipeId: recipe.id,
          recipe,
          servings: recipe.servings,
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
    setPantryOverrides(new Set());
  }, []);

  const isInMealPrep = useCallback(
    (recipeId: string) => items.some((item) => item.recipeId === recipeId),
    [items]
  );

  const getCombinedIngredients = useCallback(
    () => combineIngredients(items),
    [items]
  );

  const isOverridden = useCallback(
    (combined: CombinedIngredient) =>
      pantryOverrides.has(combineKey(combined.name, combined.unit)),
    [pantryOverrides]
  );

  const togglePantryOverride = useCallback((combined: CombinedIngredient) => {
    const key = combineKey(combined.name, combined.unit);
    setPantryOverrides((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

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
        pantryOverrides,
        isOverridden,
        togglePantryOverride,
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

export { formatQuantity } from './combine-ingredients';
