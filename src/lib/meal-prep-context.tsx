'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { Recipe, MealPrepItem, CombinedIngredient } from '@/types';
import { combineIngredients, combineKey } from './combine-ingredients';
import { fetchRecipes } from './api';

const STORAGE_KEY = 'meal-prep-v1';

interface PersistedState {
  items: { recipeId: string; servings: number }[];
  overrides: string[];
}

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
  isHydrated: boolean;
}

const MealPrepContext = createContext<MealPrepContextType | undefined>(undefined);

function readPersisted(): PersistedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed || !Array.isArray(parsed.items)) return null;
    return {
      items: parsed.items.filter(
        (i) => typeof i?.recipeId === 'string' && typeof i?.servings === 'number'
      ),
      overrides: Array.isArray(parsed.overrides)
        ? parsed.overrides.filter((s) => typeof s === 'string')
        : [],
    };
  } catch {
    return null;
  }
}

function writePersisted(items: MealPrepItem[], overrides: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: PersistedState = {
      items: items.map(({ recipeId, servings }) => ({ recipeId, servings })),
      overrides: Array.from(overrides),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Quota exceeded, private mode, etc. — silently degrade.
  }
}

function clearPersisted(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function MealPrepProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MealPrepItem[]>([]);
  const [pantryOverrides, setPantryOverrides] = useState<Set<string>>(new Set());
  const [isHydrated, setIsHydrated] = useState(false);
  const hasHydratedRef = useRef(false);

  // Hydrate once on mount: read localStorage, refetch recipes, rebuild items.
  useEffect(() => {
    let cancelled = false;
    const persisted = readPersisted();

    if (!persisted || persisted.items.length === 0) {
      if (persisted?.overrides?.length) {
        setPantryOverrides(new Set(persisted.overrides));
      }
      setIsHydrated(true);
      hasHydratedRef.current = true;
      return;
    }

    (async () => {
      try {
        const recipes = await fetchRecipes();
        if (cancelled) return;
        const byId = new Map(recipes.map((r) => [r.id, r]));
        const rebuilt: MealPrepItem[] = persisted.items
          .map((i) => {
            const recipe = byId.get(i.recipeId);
            if (!recipe) return null;
            return { recipeId: i.recipeId, recipe, servings: i.servings };
          })
          .filter((x): x is MealPrepItem => x !== null);

        setItems(rebuilt);
        setPantryOverrides(new Set(persisted.overrides));
      } catch {
        // Network error on hydrate — keep empty state, allow user to add fresh.
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
          hasHydratedRef.current = true;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on every relevant state change, but only after hydration completes
  // so the initial empty state doesn't clobber stored data.
  useEffect(() => {
    if (!hasHydratedRef.current) return;
    writePersisted(items, pantryOverrides);
  }, [items, pantryOverrides]);

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
    clearPersisted();
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
        isHydrated,
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
