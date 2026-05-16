# Recipe Manager

A personal recipe management app with meal prep planning and Google Keep integration, built with Next.js and styled with Apple's Liquid Glass design language.

## Features

- Store and manage recipes with ingredients, cooking info, and steps
- Browse recipes with sorting (A-Z, Z-A, Newest, Oldest)
- Meal prep staging area with serving adjustments
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

### 2. Configure API Key

The Google Keep endpoint is protected by an API key. Set it up:

```bash
# Generate a random API key
openssl rand -base64 32

# Copy the example env file
cp .env.example .env.local

# Edit .env.local and replace the placeholder with your generated key
# Make sure both GKEEP_API_KEY and NEXT_PUBLIC_GKEEP_API_KEY have the same value
```

Your `.env.local` should look like:
```
GKEEP_API_KEY=your-generated-random-key-here
NEXT_PUBLIC_GKEEP_API_KEY=your-generated-random-key-here
```

### 3. Set Up Google Keep Integration (Optional)

The app can send shopping lists directly to Google Keep. To enable this:

#### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

#### Installation

```bash
# Navigate to scripts directory
cd scripts

# Install Python dependencies
pip install -r requirements.txt

# Run the setup wizard
python3 google_keep.py setup
```

#### Authentication Notes

- If you have **2-Factor Authentication** enabled on your Google account (recommended), you'll need to create an App Password:
  1. Go to https://myaccount.google.com/apppasswords
  2. Select "Mail" or create a custom app name
  3. Copy the generated 16-character password
  4. Use this password during setup instead of your regular password

- Your credentials are stored securely:
  - Email is stored in a local config file
  - Master token is stored in your system's secure keyring (Keychain on macOS)

#### Testing the Connection

```bash
python3 google_keep.py test
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### Managing Recipes

1. **Add a Recipe**: Click "Add Recipe" button, fill in the form
2. **View Recipe**: Click any recipe card to see full details
3. **Edit Recipe**: From the recipe detail page, click "Edit"
4. **Delete Recipe**: From the recipe detail page, click "Delete"

### Marking Pantry Staples

In the recipe form, each ingredient row has a **Pantry** toggle. Flip it on for things you already keep stocked (salt, pepper, oil, flour, etc.) and they'll be hidden from the shopping list in meal prep. The **Suggest staples** button auto-flags common pantry items by name; review and adjust before saving.

### Meal Prep

1. **Add to Meal Prep**: From any recipe detail page, click "Add to Meal Prep"
2. **Adjust Servings**: On the Meal Prep page, use +/- buttons to scale servings
3. **View Combined List**: The right panel shows all ingredients combined into a shopping list. Ingredients flagged as pantry staples (in every contributing recipe) are hidden under a collapsible "Pantry items — not shopping" section. Click the checkbox next to any pantry item to add it back to the shopping list for this week.
4. **Send to Google Keep**: Click "Send to Google Keep" to create a checklist (pantry items are excluded unless overridden)

The shopping list will be created as a pinned checklist note in Google Keep, named with the current week's date range (e.g., "Meal Prep - Jan 19-25, 2026").

## Security

### API Key Protection

The Google Keep endpoint is protected by an API key to prevent unauthorized access:

- The key is stored in `.env.local` (gitignored, never committed)
- Both server (`GKEEP_API_KEY`) and client (`NEXT_PUBLIC_GKEEP_API_KEY`) must match
- Requests without a valid `x-api-key` header are rejected with 401 Unauthorized

### Google Keep Credentials

- Email stored in `scripts/.gkeep_config.json` (gitignored)
- Master token stored in system keyring (macOS Keychain, Windows Credential Manager, etc.)
- Never stored in code or plain text files

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

### API Key Issues

**"Unauthorized: Invalid API key" error**
- Make sure `.env.local` exists with both `GKEEP_API_KEY` and `NEXT_PUBLIC_GKEEP_API_KEY`
- Both values must be identical
- Restart the dev server after changing `.env.local`

### Google Keep Issues

**"Not authenticated" error**
```bash
cd scripts
python3 google_keep.py setup
```

**"gkeepapi not found" error**
```bash
cd scripts
pip install -r requirements.txt
```

**"python3 not found" error**
- Make sure Python 3 is installed: `python3 --version`
- On some systems, try `python` instead of `python3`

**Authentication fails with 2FA**
- Create an App Password at https://myaccount.google.com/apppasswords
- Use the 16-character app password instead of your regular password

## License

MIT
