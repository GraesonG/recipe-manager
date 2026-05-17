# Recipe Manager

A personal recipe management app with meal prep planning and Google Keep integration, built with Next.js and styled with Apple's Liquid Glass design language.

## Features

- Store and manage recipes with ingredients, cooking info, and steps
- Browse recipes with sorting (A-Z, Z-A, Newest, Oldest)
- **Import from URL** — paste a recipe page URL and the app extracts ingredients/steps/timing. Uses Schema.org JSON-LD for free when available; falls back to Claude (Anthropic) for pages without structured data.
- Meal prep staging area with serving adjustments (persists across reloads)
- Automatic ingredient combination and deduplication
- **Pantry staple flag** — mark ingredients you keep on hand (salt, oil, etc.) so they're excluded from the shopping list
- Send shopping lists to Google Keep

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Liquid Glass design system
- **Data Storage**: JSON file (local)
- **Google Keep**: Python script with gkeepapi

## Getting Started

### 1. Install Node.js Dependencies

```bash
cd recipe-manager
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

#### Anthropic API Key (optional — only for AI URL import on non-JSON-LD pages)

Get a key at [console.anthropic.com](https://console.anthropic.com/) and add it to `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Without it, "Import from URL" still works on pages that publish Schema.org `Recipe` JSON-LD (most major recipe sites). Pages without JSON-LD will return a 503 prompting setup.

#### Google Keep

No env var needed for the route itself — it's protected by a same-origin check. The Google credentials live in your OS keyring; set them up by following [docs/google-keep-setup.md](./docs/google-keep-setup.md).

### 3. Set Up Google Keep Integration (Optional)

See [docs/google-keep-setup.md](./docs/google-keep-setup.md) for the full walkthrough (Python deps, auth wizard, 2FA app password, smoke test). The **Copy as text** button on the meal-prep page is always available as a fallback.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### Managing Recipes

1. **Add a Recipe**: Click "Add Recipe" button, fill in the form
2. **Import from URL**: Click "Import from URL" in the toolbar, paste a recipe URL. We try Schema.org JSON-LD first (free), then fall back to Claude if needed. You review and edit the extracted recipe before saving.
3. **View Recipe**: Click any recipe card to see full details
4. **Edit Recipe**: From the recipe detail page, click "Edit"
5. **Delete Recipe**: From the recipe detail page, click "Delete"

### Marking Pantry Staples

In the recipe form, each ingredient row has a **Pantry** toggle. Flip it on for things you already keep stocked (salt, pepper, oil, flour, etc.) and they'll be hidden from the shopping list in meal prep. The **Suggest staples** button auto-flags common pantry items by name; review and adjust before saving.

### Meal Prep

1. **Add to Meal Prep**: From the home grid, click the **+** button in the top-right corner of any recipe card (or use the "Add to Meal Prep" button on the recipe detail page). Your meal-prep selection persists across page reloads.
2. **Adjust Servings**: On the Meal Prep page, use +/- buttons to scale servings
3. **View Combined List**: The right panel shows all ingredients combined into a shopping list. Ingredients flagged as pantry staples (in every contributing recipe) are hidden under a collapsible "Pantry items — not shopping" section. Click the checkbox next to any pantry item to add it back to the shopping list for this week.
4. **Send to Google Keep**: Click "Send to Google Keep" to create a checklist (pantry items are excluded unless overridden)

The shopping list will be created as a pinned checklist note in Google Keep, named with the current week's date range (e.g., "Meal Prep - Jan 19-25, 2026").

## Security

### Google Keep endpoint

- Same-origin check on `/api/google-keep` — cross-origin requests are rejected with 403.
- Subprocess invoked with `execFile` (no shell parsing). Page input is JSON-serialized to a temp file, not interpolated.
- Server-side validation: title 1–200 chars, ≤200 ingredients, name 1–200, qty/unit ≤40.

### Google Keep credentials

- Email stored in `scripts/.gkeep_config.json` (gitignored).
- Master token stored in system keyring (macOS Keychain / Windows Credential Manager / Secret Service on Linux). Never written to a file or shipped to the browser.

### Import from URL endpoint

- SSRF guard: URL must be http(s); DNS-resolves and rejects loopback, private (10/8, 172.16/12, 192.168/16), link-local, and IPv6 ULA/LL.
- Resource caps: 10s fetch timeout, 2 MB response body cap.
- Prompt injection defense: untrusted page content wrapped in `<recipe_source>` tags; LLM output forced through a fixed JSON-Schema tool; no other tools given to the model.
- Server-side Zod validation with length and array-size caps before the recipe reaches the client.
- In-memory rate limit: 10 imports/hour total.

## Project Structure

```
recipe-manager/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   │   ├── recipes/     # Recipe CRUD endpoints
│   │   │   └── google-keep/ # Google Keep integration (protected)
│   │   ├── recipes/         # Recipe pages
│   │   └── meal-prep/       # Meal prep page
│   ├── components/          # React components
│   │   └── ui/              # Liquid Glass UI components
│   ├── lib/                 # Utilities and helpers
│   └── types/               # TypeScript types
├── data/                    # JSON data storage
├── scripts/                 # Python scripts
│   ├── google_keep.py       # Google Keep integration
│   └── requirements.txt     # Python dependencies
├── .env.example             # Example environment variables
├── .env.local               # Local environment variables (gitignored)
└── tmp/                     # Temporary files (gitignored)
```

## Design System

This app uses Apple's Liquid Glass design principles:
- Translucent panels with backdrop blur
- Specular highlights and subtle gradients
- Rounded corners that harmonize with modern hardware
- Content-first approach with controls that recede
- Dark mode optimized for 11" MacBook Air

## Troubleshooting

### Google Keep

See [docs/google-keep-setup.md](./docs/google-keep-setup.md). The most common cause of failure is using your regular Google password instead of an App Password when 2FA is on.

### "Import from URL" returns 503

That means the page didn't have Schema.org `Recipe` JSON-LD and `ANTHROPIC_API_KEY` isn't set. Either set the key in `.env.local`, or paste the recipe content manually.

## License

MIT
