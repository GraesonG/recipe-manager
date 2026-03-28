import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

// API Key for protection
const API_KEY = process.env.GKEEP_API_KEY;

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

/**
 * Validate the API key from request headers
 */
function validateApiKey(request: NextRequest): boolean {
  // If no API key is configured, allow all requests (development convenience)
  if (!API_KEY || API_KEY === 'your-secret-key-change-this-in-production') {
    console.warn('Warning: GKEEP_API_KEY not configured. API is unprotected.');
    return true;
  }

  const providedKey = request.headers.get('x-api-key');
  return providedKey === API_KEY;
}

/**
 * POST /api/google-keep
 * Send shopping list to Google Keep via Python script
 */
export async function POST(request: NextRequest) {
  // Validate API key
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid API key' },
      { status: 401 }
    );
  }

  try {
    const body: GoogleKeepRequest = await request.json();

    // Validate request
    if (!body.title || !body.ingredients || body.ingredients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: title and ingredients are required' },
        { status: 400 }
      );
    }

    // Prepare the data for the Python script
    const listData = {
      title: body.title,
      ingredients: body.ingredients,
    };

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Write to a temporary JSON file
    const tempFile = path.join(tempDir, `shopping-list-${Date.now()}.json`);
    await writeFile(tempFile, JSON.stringify(listData, null, 2));

    try {
      // Path to the Python script
      const scriptPath = path.join(process.cwd(), 'scripts', 'google_keep.py');

      // Execute the Python script
      const { stdout, stderr } = await execAsync(
        `python3 "${scriptPath}" send "${tempFile}"`,
        {
          timeout: 30000, // 30 second timeout
          env: { ...process.env },
        }
      );

      // Log output for debugging
      if (stderr) {
        console.error('Python script stderr:', stderr);
      }
      console.log('Python script stdout:', stdout);

      // Parse the result from the Python script
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
        } else {
          return NextResponse.json(
            { success: false, error: result.error || 'Failed to send to Google Keep' },
            { status: 500 }
          );
        }
      }

      // If we couldn't parse the result, check if it looks like success
      if (stdout.includes('Shopping list sent to Google Keep')) {
        return NextResponse.json({
          success: true,
          message: 'Shopping list sent to Google Keep!',
          data: {
            title: body.title,
            itemCount: body.ingredients.length,
          },
        });
      }

      // Unknown response
      return NextResponse.json(
        { success: false, error: 'Unexpected response from Google Keep script' },
        { status: 500 }
      );

    } catch (execError: any) {
      console.error('Error executing Python script:', execError);

      // Check for common errors
      if (execError.message?.includes('python3: not found') || execError.message?.includes('python3')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Python 3 is not installed or not in PATH. Please install Python 3.' 
          },
          { status: 500 }
        );
      }

      if (execError.message?.includes('Not authenticated') || execError.stderr?.includes('Not authenticated')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Google Keep not authenticated. Please run: cd scripts && python3 google_keep.py setup' 
          },
          { status: 401 }
        );
      }

      if (execError.message?.includes('gkeepapi') || execError.stderr?.includes('gkeepapi')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Required Python packages not installed. Please run: cd scripts && pip install -r requirements.txt' 
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to execute Google Keep script: ${execError.message || 'Unknown error'}` 
        },
        { status: 500 }
      );

    } finally {
      // Clean up temp file
      try {
        await unlink(tempFile);
      } catch {
        // Ignore cleanup errors
      }
    }

  } catch (error) {
    console.error('Error processing Google Keep request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/google-keep
 * Check if Google Keep is configured
 */
export async function GET(request: NextRequest) {
  // Validate API key
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid API key' },
      { status: 401 }
    );
  }

  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'google_keep.py');
    
    // Check if script exists
    if (!existsSync(scriptPath)) {
      return NextResponse.json({
        configured: false,
        error: 'Google Keep script not found',
      });
    }

    // Try to test the connection
    try {
      const { stdout, stderr } = await execAsync(
        `python3 "${scriptPath}" test`,
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

    } catch (execError: any) {
      if (execError.message?.includes('Not authenticated') || execError.stderr?.includes('Not authenticated')) {
        return NextResponse.json({
          configured: false,
          error: 'Google Keep authentication required',
          setupInstructions: 'Run: cd scripts && python3 google_keep.py setup',
        });
      }

      return NextResponse.json({
        configured: false,
        error: execError.message || 'Failed to check Google Keep status',
      });
    }

  } catch (error) {
    console.error('Error checking Google Keep status:', error);
    return NextResponse.json({
      configured: false,
      error: 'Failed to check Google Keep status',
    });
  }
}
