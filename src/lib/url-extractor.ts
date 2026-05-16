import { promises as dns } from 'dns';
import net from 'net';
import { IngredientInput, CookingInfoInput, RecipeInput } from '@/types';

export const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
export const FETCH_TIMEOUT_MS = 10_000;
const USER_AGENT = 'RecipeManager/1.0';

export class UrlExtractionError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'UrlExtractionError';
  }
}

export function isValidHttpUrl(input: string): boolean {
  try {
    const u = new URL(input);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function isBlockedIp(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 0) return true;

  if (family === 4) {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 127) return true; // loopback
    if (a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16/12
    if (a === 192 && b === 168) return true; // 192.168/16
    if (a >= 224) return true; // multicast + reserved
    return false;
  }

  // IPv6
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::') return true;
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // unique local
  if (lower.startsWith('fe80')) return true; // link-local
  return false;
}

export async function assertPublicUrl(url: string): Promise<void> {
  if (!isValidHttpUrl(url)) {
    throw new UrlExtractionError('invalid_url', 'URL must be http(s)');
  }
  const { hostname } = new URL(url);
  let addrs: { address: string; family: number }[];
  try {
    addrs = await dns.lookup(hostname, { all: true });
  } catch {
    throw new UrlExtractionError('dns_failed', `Could not resolve ${hostname}`);
  }
  if (addrs.length === 0) {
    throw new UrlExtractionError('dns_failed', `Could not resolve ${hostname}`);
  }
  for (const { address } of addrs) {
    if (isBlockedIp(address)) {
      throw new UrlExtractionError(
        'private_address',
        `${hostname} resolves to a non-public address`
      );
    }
  }
}

export async function fetchWithLimits(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,*/*' },
    });
    if (!response.ok) {
      throw new UrlExtractionError(
        'fetch_failed',
        `Source returned HTTP ${response.status}`
      );
    }
    const reader = response.body?.getReader();
    if (!reader) {
      throw new UrlExtractionError('fetch_failed', 'Empty response body');
    }
    const decoder = new TextDecoder('utf-8');
    let total = 0;
    let text = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        await reader.cancel();
        throw new UrlExtractionError(
          'too_large',
          `Source exceeded ${MAX_BYTES} bytes`
        );
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return text;
  } catch (err) {
    if (err instanceof UrlExtractionError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new UrlExtractionError('timeout', 'Fetch timed out');
    }
    throw new UrlExtractionError(
      'fetch_failed',
      err instanceof Error ? err.message : 'Fetch failed'
    );
  } finally {
    clearTimeout(timeout);
  }
}

const SCRIPT_LD_RE =
  /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [k: string]: JsonValue };

function flattenJsonLd(node: JsonValue, out: Record<string, JsonValue>[]): void {
  if (Array.isArray(node)) {
    node.forEach((n) => flattenJsonLd(n, out));
    return;
  }
  if (node && typeof node === 'object') {
    const obj = node as Record<string, JsonValue>;
    out.push(obj);
    if (obj['@graph']) flattenJsonLd(obj['@graph'], out);
  }
}

function matchesRecipeType(node: Record<string, JsonValue>): boolean {
  const t = node['@type'];
  if (typeof t === 'string') return t === 'Recipe';
  if (Array.isArray(t)) return t.includes('Recipe');
  return false;
}

export function findRecipeJsonLd(html: string): Record<string, JsonValue> | null {
  const matches = Array.from(html.matchAll(SCRIPT_LD_RE));
  for (const m of matches) {
    try {
      const parsed = JSON.parse(m[1]);
      const nodes: Record<string, JsonValue>[] = [];
      flattenJsonLd(parsed, nodes);
      const recipe = nodes.find(matchesRecipeType);
      if (recipe) return recipe;
    } catch {
      // ignore malformed JSON-LD block
    }
  }
  return null;
}

const UNIT_TOKENS = new Set([
  'cup', 'cups', 'c',
  'tsp', 'teaspoon', 'teaspoons',
  'tbsp', 'tablespoon', 'tablespoons',
  'g', 'gram', 'grams',
  'kg', 'kilogram', 'kilograms',
  'oz', 'ounce', 'ounces',
  'lb', 'lbs', 'pound', 'pounds',
  'ml', 'milliliter', 'milliliters',
  'l', 'liter', 'liters',
  'pinch', 'dash', 'clove', 'cloves',
  'slice', 'slices', 'piece', 'pieces',
  'can', 'cans', 'pkg', 'package',
  'small', 'medium', 'large',
]);

// Best-effort: split "2 cups flour, sifted" into {quantity, unit, name}.
export function parseIngredientString(raw: string): IngredientInput {
  const trimmed = raw.trim();
  if (!trimmed) return { name: '', quantity: '', unit: '' };

  const tokens = trimmed.split(/\s+/);
  let i = 0;

  // Collect leading numeric/fraction tokens as quantity.
  const qty: string[] = [];
  const numRe = /^(\d+(\.\d+)?|\d+\/\d+|\d+\s+\d+\/\d+)$/;
  while (i < tokens.length && numRe.test(tokens[i])) {
    qty.push(tokens[i]);
    i += 1;
  }

  let unit = '';
  if (i < tokens.length) {
    const candidate = tokens[i].replace(/\.$/, '').toLowerCase();
    if (UNIT_TOKENS.has(candidate)) {
      unit = tokens[i].replace(/\.$/, '');
      i += 1;
    }
  }

  const name = tokens.slice(i).join(' ').replace(/^[,\s]+/, '').trim();

  return {
    name: name || trimmed,
    quantity: qty.join(' '),
    unit,
  };
}

function parseDurationToMinutes(iso: string): number | null {
  // Minimal ISO 8601 duration parser: PT#H#M
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?$/.exec(iso);
  if (!m) return null;
  const h = m[1] ? parseInt(m[1], 10) : 0;
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const total = h * 60 + min;
  return total > 0 ? total : null;
}

function formatDuration(label: string, iso: string): CookingInfoInput | null {
  const minutes = parseDurationToMinutes(iso);
  if (!minutes) return null;
  const time =
    minutes >= 60
      ? `${Math.floor(minutes / 60)}h ${minutes % 60 ? `${minutes % 60}min` : ''}`.trim()
      : `${minutes} min`;
  return { time, temp: '', description: label };
}

function extractSteps(node: JsonValue): string[] {
  if (!node) return [];
  if (typeof node === 'string') {
    return node.split(/\r?\n+/).map((s) => s.trim()).filter(Boolean);
  }
  if (!Array.isArray(node)) return [];
  return node
    .map((entry) => {
      if (typeof entry === 'string') return entry.trim();
      if (entry && typeof entry === 'object') {
        const e = entry as Record<string, JsonValue>;
        if (typeof e.text === 'string') return e.text.trim();
        if (typeof e.name === 'string') return e.name.trim();
      }
      return '';
    })
    .filter(Boolean);
}

function extractServings(node: JsonValue): number {
  if (typeof node === 'number') return Math.max(1, Math.round(node));
  if (Array.isArray(node) && node.length > 0) return extractServings(node[0]);
  if (typeof node === 'string') {
    const m = /\d+/.exec(node);
    if (m) return Math.max(1, parseInt(m[0], 10));
  }
  return 4;
}

export function jsonLdToRecipeInput(
  node: Record<string, JsonValue>,
  sourceUrl: string
): RecipeInput | null {
  const name = typeof node.name === 'string' ? node.name.trim() : '';
  if (!name) return null;

  const rawIngredients = Array.isArray(node.recipeIngredient)
    ? node.recipeIngredient
    : [];
  const ingredients: IngredientInput[] = rawIngredients
    .filter((s): s is string => typeof s === 'string')
    .map((s) => parseIngredientString(s))
    .filter((i) => i.name.length > 0);

  if (ingredients.length === 0) return null;

  const steps = extractSteps(node.recipeInstructions ?? null);
  if (steps.length === 0) return null;

  const cookingInfo: CookingInfoInput[] = [];
  if (typeof node.prepTime === 'string') {
    const ci = formatDuration('Prep', node.prepTime);
    if (ci) cookingInfo.push(ci);
  }
  if (typeof node.cookTime === 'string') {
    const ci = formatDuration('Cook', node.cookTime);
    if (ci) cookingInfo.push(ci);
  }

  return {
    name,
    servings: extractServings(node.recipeYield ?? null),
    ingredients,
    cookingInfo,
    steps,
    sourceUrl,
  };
}

export function cleanHtmlForLlm(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60_000);
}
