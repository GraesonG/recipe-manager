import { describe, it, expect } from 'vitest';
import { formatQuantity } from '../meal-prep-context';

describe('formatQuantity', () => {
  it('returns empty string for zero', () => {
    expect(formatQuantity(0)).toBe('');
  });

  it('returns whole numbers without decimals', () => {
    expect(formatQuantity(2)).toBe('2');
    expect(formatQuantity(10)).toBe('10');
  });

  it('renders common fractions as unicode symbols', () => {
    expect(formatQuantity(0.5)).toBe('½');
    expect(formatQuantity(0.25)).toBe('¼');
    expect(formatQuantity(0.75)).toBe('¾');
  });

  it('combines whole part with fractional unicode symbol', () => {
    expect(formatQuantity(1.5)).toBe('1 ½');
    expect(formatQuantity(2.25)).toBe('2 ¼');
  });

  it('falls back to decimal for uncommon fractions', () => {
    expect(formatQuantity(1.1)).toBe('1.1');
  });
});
