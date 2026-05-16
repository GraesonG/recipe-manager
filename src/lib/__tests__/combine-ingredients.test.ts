import { describe, it, expect } from 'vitest';
import {
  combineIngredients,
  formatQuantity,
  isLikelyStaple,
} from '../combine-ingredients';
import { Recipe, MealPrepItem } from '@/types';

const makeRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
  id: 'r1',
  name: 'Test Recipe',
  servings: 4,
  ingredients: [],
  cookingInfo: [],
  steps: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const makeItem = (recipe: Recipe, servings?: number): MealPrepItem => ({
  recipeId: recipe.id,
  recipe,
  servings: servings ?? recipe.servings,
});

describe('formatQuantity', () => {
  it('returns empty string for zero', () => {
    expect(formatQuantity(0)).toBe('');
  });

  it('returns whole numbers without decimals', () => {
    expect(formatQuantity(2)).toBe('2');
  });

  it('renders common fractions as unicode symbols', () => {
    expect(formatQuantity(0.5)).toBe('½');
    expect(formatQuantity(1.5)).toBe('1 ½');
  });

  it('falls back to decimal for uncommon fractions', () => {
    expect(formatQuantity(1.1)).toBe('1.1');
  });
});

describe('isLikelyStaple', () => {
  it('flags common pantry items', () => {
    expect(isLikelyStaple('Salt')).toBe(true);
    expect(isLikelyStaple('black pepper')).toBe(true);
    expect(isLikelyStaple('  Olive Oil  ')).toBe(true);
  });

  it('does not flag non-staples', () => {
    expect(isLikelyStaple('chicken breast')).toBe(false);
    expect(isLikelyStaple('cilantro')).toBe(false);
  });
});

describe('combineIngredients', () => {
  it('sums quantities for matching name+unit', () => {
    const a = makeRecipe({
      id: 'a',
      name: 'Recipe A',
      ingredients: [{ id: 'i1', name: 'Flour', quantity: '100', unit: 'g' }],
    });
    const b = makeRecipe({
      id: 'b',
      name: 'Recipe B',
      ingredients: [{ id: 'i2', name: 'flour', quantity: '50', unit: 'G' }],
    });

    const combined = combineIngredients([makeItem(a), makeItem(b)]);

    expect(combined).toHaveLength(1);
    expect(combined[0].totalQuantity).toBe(150);
    expect(combined[0].originalQuantities).toHaveLength(2);
  });

  it('scales by servings multiplier', () => {
    const r = makeRecipe({
      servings: 4,
      ingredients: [{ id: 'i1', name: 'Pasta', quantity: '200', unit: 'g' }],
    });

    const combined = combineIngredients([makeItem(r, 8)]); // double servings

    expect(combined[0].totalQuantity).toBe(400);
  });

  it('keeps mismatched units as separate rows', () => {
    const r = makeRecipe({
      ingredients: [
        { id: 'i1', name: 'Olive Oil', quantity: '2', unit: 'tbsp' },
        { id: 'i2', name: 'Olive Oil', quantity: '50', unit: 'ml' },
      ],
    });

    const combined = combineIngredients([makeItem(r)]);

    expect(combined).toHaveLength(2);
  });

  // Pantry-staple aggregation: the focus of Phase 1.
  describe('isPantryStaple aggregation', () => {
    it('marks combined ingredient as staple when ALL contributors are staple', () => {
      const a = makeRecipe({
        id: 'a',
        name: 'Recipe A',
        ingredients: [
          { id: 'i1', name: 'Salt', quantity: '1', unit: 'tsp', isPantryStaple: true },
        ],
      });
      const b = makeRecipe({
        id: 'b',
        name: 'Recipe B',
        ingredients: [
          { id: 'i2', name: 'Salt', quantity: '0.5', unit: 'tsp', isPantryStaple: true },
        ],
      });

      const combined = combineIngredients([makeItem(a), makeItem(b)]);
      expect(combined[0].isPantryStaple).toBe(true);
    });

    it('does NOT mark as staple when any contributor is non-staple', () => {
      const a = makeRecipe({
        id: 'a',
        ingredients: [
          { id: 'i1', name: 'Garlic', quantity: '2', unit: 'cloves', isPantryStaple: true },
        ],
      });
      const b = makeRecipe({
        id: 'b',
        ingredients: [
          { id: 'i2', name: 'Garlic', quantity: '3', unit: 'cloves' /* not flagged */ },
        ],
      });

      const combined = combineIngredients([makeItem(a), makeItem(b)]);
      expect(combined[0].isPantryStaple).toBe(false);
    });

    it('treats missing flag as non-staple', () => {
      const r = makeRecipe({
        ingredients: [{ id: 'i1', name: 'Tomato', quantity: '2', unit: 'medium' }],
      });

      const combined = combineIngredients([makeItem(r)]);
      expect(combined[0].isPantryStaple).toBe(false);
    });
  });
});
