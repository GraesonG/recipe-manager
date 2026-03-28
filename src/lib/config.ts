/**
 * Application configuration
 * API keys are loaded from environment variables
 */

// Google Keep API key - must match the server's GKEEP_API_KEY
// In production, this would be set via environment variables
// For local development, it reads from .env.local
export const config = {
  googleKeepApiKey: process.env.NEXT_PUBLIC_GKEEP_API_KEY || '',
};
