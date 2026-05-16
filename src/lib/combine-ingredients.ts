import { CombinedIngredient, MealPrepItem } from '@/types';

export function combineKey(name: string, unit: string): string {
  return `${name.toLowerCase().trim()}|${unit.toLowerCase().trim()}`;
}

export function parseQuantity(quantity: string): number {
  if (!quantity || quantity.trim() === '') return 0;

  const trimmed = quantity.trim();

  const direct = parseFloat(trimmed);
  if (!isNaN(direct) && !trimmed.includes('/')) {
    return direct;
  }

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

export function formatQuantity(quantity: number): string {
  if (quantity === 0) return '';

  const rounded = Math.round(quantity * 100) / 100;

  if (rounded === Math.floor(rounded)) {
    return rounded.toString();
  }

  const fractions: [number, string][] = [
    [0.25, '¼'],
    [0.33, '⅓'],
    [0.5, '½'],
    [0.67, '⅔'],
    [0.75, '¾'],
  ];

  const wholePart = Math.floor(rounded);
  const decimalPart = rounded - wholePart;

  for (const [value, symbol] of fractions) {
    if (Math.abs(decimalPart - value) < 0.05) {
      return wholePart > 0 ? `${wholePart} ${symbol}` : symbol;
    }
  }

  return rounded.toFixed(2).replace(/\.?0+$/, '');
}

export function combineIngredients(items: MealPrepItem[]): CombinedIngredient[] {
  const map = new Map<string, CombinedIngredient>();

  items.forEach((item) => {
    const servingsMultiplier = item.servings / item.recipe.servings;

    item.recipe.ingredients.forEach((ingredient) => {
      const key = combineKey(ingredient.name, ingredient.unit);
      const scaledQuantity = parseQuantity(ingredient.quantity) * servingsMultiplier;
      const isStaple = ingredient.isPantryStaple ?? false;

      const existing = map.get(key);
      if (existing) {
        existing.totalQuantity += scaledQuantity;
        existing.isPantryStaple = existing.isPantryStaple && isStaple;
        existing.originalQuantities.push({
          recipeId: item.recipeId,
          recipeName: item.recipe.name,
          quantity: scaledQuantity,
          servingsMultiplier,
        });
      } else {
        map.set(key, {
          name: ingredient.name,
          unit: ingredient.unit,
          totalQuantity: scaledQuantity,
          isPantryStaple: isStaple,
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

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

const STAPLE_WHITELIST = new Set([
  'salt',
  'pepper',
  'black pepper',
  'white pepper',
  'olive oil',
  'oil',
  'vegetable oil',
  'canola oil',
  'flour',
  'all-purpose flour',
  'sugar',
  'brown sugar',
  'garlic powder',
  'onion powder',
  'butter',
  'water',
  'baking soda',
  'baking powder',
]);

export function isLikelyStaple(ingredientName: string): boolean {
  return STAPLE_WHITELIST.has(ingredientName.toLowerCase().trim());
}
