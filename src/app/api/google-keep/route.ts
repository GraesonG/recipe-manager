import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const execFileAsync = promisify(execFile);

interface ShoppingListItem {
  name: string;
  quantity: string;
  unit: string;
}

interface GoogleKeepRequest {
  title: string;
  ingredients: ShoppingListItem[];
}

interface GoogleKeepResult {
  success: boolean;
  noteId?: string;
  title?: string;
  itemCount?: number;
  error?: string;
}

const SCRIPT_PATH = path.join(process.cwd(), 'scripts', 'google_keep.py');
const TEMP_DIR = path.join(process.cwd(), 'tmp');

// Same-origin guard. Replaces the previous NEXT_PUBLIC_GKEEP_API_KEY shipped-
// to-client check (which provided no real protection). The route is only
// intended to be called from this app's own pages.
function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin) return true; // server-rendered same-origin fetches don't send Origin
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function originGuard(request: NextRequest): NextResponse | null {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { success: false, error: 'Cross-origin requests are not allowed' },
      { status: 403 }
    );
  }
  return null;
}

function validateBody(body: unknown): { ok: true; data: GoogleKeepRequest } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' };
  const b = body as Record<string, unknown>;
  const title = typeof b.title === 'string' ? b.title.trim() : '';
  if (!title || title.length > 200) {
    return { ok: false, error: 'title must be 1–200 chars' };
  }
  if (!Array.isArray(b.ingredients) || b.ingredients.length === 0) {
    return { ok: false, error: 'ingredients must be a non-empty array' };
  }
  if (b.ingredients.length > 200) {
    return { ok: false, error: 'too many ingredients (max 200)' };
  }
  const ingredients: ShoppingListItem[] = [];
  for (const raw of b.ingredients) {
    if (!raw || typeof raw !== 'object') {
      return { ok: false, error: 'ingredient entries must be objects' };
    }
    const item = raw as Record<string, unknown>;
    const name = typeof item.name === 'string' ? item.name.trim() : '';
    const quantity = typeof item.quantity === 'string' ? item.quantity.trim() : '';
    const unit = typeof item.unit === 'string' ? item.unit.trim() : '';
    if (!name || name.length > 200) {
      return { ok: false, error: 'ingredient name must be 1–200 chars' };
    }
    if (quantity.length > 40 || unit.length > 40) {
      return { ok: false, error: 'ingredient quantity/unit must be ≤40 chars' };
    }
    ingredients.push({ name, quantity, unit });
  }
  return { ok: true, data: { title, ingredients } };
}

export async function POST(request: NextRequest) {
  const guard = originGuard(request);
  if (guard) return guard;

  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const validation = validateBody(parsed);
  if (!validation.ok) {
    return NextResponse.json(
      { success: false, error: validation.error },
      { status: 400 }
    );
  }

  if (!existsSync(TEMP_DIR)) {
    await mkdir(TEMP_DIR, { recursive: true });
  }

  const tempFile = path.join(TEMP_DIR, `shopping-list-${Date.now()}.json`);
  await writeFile(tempFile, JSON.stringify(validation.data, null, 2));

  try {
    const { stdout, stderr } = await execFileAsync(
      'python3',
      [SCRIPT_PATH, 'send', tempFile],
      { timeout: 30000 }
    );

    if (stderr) console.error('Python script stderr:', stderr);

    const resultMatch = stdout.match(/RESULT_JSON:(.+)/);
    if (resultMatch) {
      const result: GoogleKeepResult = JSON.parse(resultMatch[1]);
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Shopping list sent to Google Keep!',
          data: {
            noteId: result.noteId,
            title: result.title,
            itemCount: result.itemCount,
          },
        });
      }
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send to Google Keep' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Unexpected response from Google Keep script' },
      { status: 500 }
    );
  } catch (execError: unknown) {
    return NextResponse.json(scriptErrorBody(execError), { status: 500 });
  } finally {
    try {
      await unlink(tempFile);
    } catch {
      // ignore cleanup errors
    }
  }
}

export async function GET(request: NextRequest) {
  const guard = originGuard(request);
  if (guard) return guard;

  if (!existsSync(SCRIPT_PATH)) {
    return NextResponse.json({
      configured: false,
      error: 'Google Keep script not found',
    });
  }

  try {
    const { stdout } = await execFileAsync(
      'python3',
      [SCRIPT_PATH, 'test'],
      { timeout: 15000 }
    );
    if (stdout.includes('Connection successful')) {
      return NextResponse.json({
        configured: true,
        message: 'Google Keep is configured and connected',
      });
    }
    return NextResponse.json({
      configured: false,
      error: 'Google Keep authentication required',
      setupInstructions: 'Run: cd scripts && python3 google_keep.py setup',
    });
  } catch (execError: unknown) {
    return NextResponse.json({
      configured: false,
      ...scriptErrorBody(execError),
    });
  }
}

function scriptErrorBody(err: unknown): { success: false; error: string } {
  const message =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
      ? err
      : 'Unknown error';
  const stderr =
    err && typeof err === 'object' && 'stderr' in err && typeof (err as { stderr?: unknown }).stderr === 'string'
      ? ((err as { stderr: string }).stderr as string)
      : '';

  if (message.includes('ENOENT') || message.includes('python3')) {
    return {
      success: false,
      error: 'Python 3 is not installed or not in PATH.',
    };
  }
  if (message.includes('Not authenticated') || stderr.includes('Not authenticated')) {
    return {
      success: false,
      error: 'Google Keep not authenticated. Run: cd scripts && python3 google_keep.py setup',
    };
  }
  if (message.includes('gkeepapi') || stderr.includes('gkeepapi')) {
    return {
      success: false,
      error: 'Required Python packages not installed. Run: cd scripts && pip install -r requirements.txt',
    };
  }
  return { success: false, error: message };
}
