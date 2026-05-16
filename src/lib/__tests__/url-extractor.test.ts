import { describe, it, expect } from 'vitest';
import {
  isValidHttpUrl,
  findRecipeJsonLd,
  jsonLdToRecipeInput,
  parseIngredientString,
  cleanHtmlForLlm,
} from '../url-extractor';

describe('isValidHttpUrl', () => {
  it('accepts http and https URLs', () => {
    expect(isValidHttpUrl('http://example.com')).toBe(true);
    expect(isValidHttpUrl('https://example.com/path')).toBe(true);
  });

  it('rejects other schemes and malformed URLs', () => {
    expect(isValidHttpUrl('file:///etc/passwd')).toBe(false);
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isValidHttpUrl('not a url')).toBe(false);
  });
});

describe('parseIngredientString', () => {
  it('splits qty + unit + name', () => {
    const result = parseIngredientString('2 cups flour');
    expect(result.quantity).toBe('2');
    expect(result.unit).toBe('cups');
    expect(result.name).toBe('flour');
  });

  it('handles fractional and mixed quantities', () => {
    expect(parseIngredientString('1/2 tsp salt').quantity).toBe('1/2');
    expect(parseIngredientString('1 1/2 cups milk').quantity).toBe('1 1/2');
  });

  it('falls back gracefully when no number is present', () => {
    const result = parseIngredientString('salt to taste');
    expect(result.name).toBe('salt to taste');
    expect(result.quantity).toBe('');
  });

  it('keeps the whole string when no unit is recognized', () => {
    const result = parseIngredientString('3 large eggs');
    expect(result.quantity).toBe('3');
    expect(result.unit).toBe('large');
    expect(result.name).toBe('eggs');
  });
});

describe('findRecipeJsonLd', () => {
  it('finds a Recipe entry inside a script tag', () => {
    const html = `<html><head><script type="application/ld+json">
      {"@context":"https://schema.org","@type":"Recipe","name":"Test"}
    </script></head></html>`;
    const node = findRecipeJsonLd(html);
    expect(node?.name).toBe('Test');
  });

  it('handles @type as an array', () => {
    const html = `<script type="application/ld+json">
      {"@type":["Recipe","BlogPosting"],"name":"Test"}
    </script>`;
    expect(findRecipeJsonLd(html)?.name).toBe('Test');
  });

  it('returns null when no Recipe is present', () => {
    const html = `<script type="application/ld+json">
      {"@type":"Article","name":"Not a recipe"}
    </script>`;
    expect(findRecipeJsonLd(html)).toBeNull();
  });

  it('skips malformed JSON blocks and keeps searching', () => {
    const html = `
      <script type="application/ld+json">{ this is not json }</script>
      <script type="application/ld+json">{"@type":"Recipe","name":"Survives"}</script>
    `;
    expect(findRecipeJsonLd(html)?.name).toBe('Survives');
  });
});

describe('jsonLdToRecipeInput', () => {
  it('maps a normal Recipe JSON-LD to RecipeInput', () => {
    const node = {
      '@type': 'Recipe',
      name: 'Pasta Test',
      recipeYield: '4 servings',
      recipeIngredient: ['200 g pasta', '1 tsp salt'],
      recipeInstructions: [
        { '@type': 'HowToStep', text: 'Boil water.' },
        { '@type': 'HowToStep', text: 'Add pasta.' },
      ],
      prepTime: 'PT10M',
      cookTime: 'PT15M',
    };
    const input = jsonLdToRecipeInput(node, 'https://example.com/x');
    expect(input?.name).toBe('Pasta Test');
    expect(input?.servings).toBe(4);
    expect(input?.ingredients).toHaveLength(2);
    expect(input?.steps).toEqual(['Boil water.', 'Add pasta.']);
    expect(input?.cookingInfo).toHaveLength(2);
    expect(input?.sourceUrl).toBe('https://example.com/x');
  });

  it('returns null when required fields are missing', () => {
    expect(jsonLdToRecipeInput({ '@type': 'Recipe' }, 'https://x.test')).toBeNull();
  });
});

describe('cleanHtmlForLlm', () => {
  it('strips script and style blocks', () => {
    const html = '<p>Recipe</p><script>alert(1)</script><style>a{}</style>';
    expect(cleanHtmlForLlm(html)).toBe('Recipe');
  });

  it('caps output length', () => {
    const html = '<p>' + 'a'.repeat(100_000) + '</p>';
    expect(cleanHtmlForLlm(html).length).toBeLessThanOrEqual(60_000);
  });
});
