# Google Keep Setup

The app can push your meal-prep shopping list to a pinned checklist in Google Keep. The integration uses a small Python script that talks to `gkeepapi` — an **unofficial** Google Keep client. It can break with no warning when Google changes things; that's why it's optional.

## What gets stored where

- **Google account email**: `scripts/.gkeep_config.json` (gitignored).
- **Google master token**: your OS keyring (macOS Keychain / Windows Credential Manager / Secret Service on Linux). Never written to a file or shipped to the browser.
- **App API key**: none needed. The `/api/google-keep` route enforces a same-origin check.

## One-time setup

### 1. Install the Python dependencies

```
cd scripts
pip install -r requirements.txt
```

Python 3.7+ required.

### 2. Run the auth wizard

```
python3 google_keep.py setup
```

It prompts for your Google account email and password. If you have 2-Factor Authentication on (you should), generate an **App Password** first:

1. Open https://myaccount.google.com/apppasswords
2. Pick "Mail" or create a custom name
3. Use the 16-character app password during setup — not your normal password.

### 3. Smoke-test the connection

```
python3 google_keep.py test
```

Look for "Connection successful". If it fails, the most common cause is using your regular password instead of an app password.

## Verifying from the app

Restart the dev server (`npm run dev`) and open the meal-prep page. The **Send to Google Keep** button enables when the route's GET handler reports `{ configured: true }`. If the button stays disabled, hover for a tooltip pointing back here.

## Fallback

The **Copy as text** button on the meal-prep page always works — it puts a plain-text shopping list on your clipboard, so you have a way out even when Keep is broken or unconfigured.

## When things break

The `gkeepapi` library is community-maintained and not officially supported by Google. If it stops working after a Google update:

- Check https://github.com/kiwiz/gkeepapi for known issues.
- Re-run `python3 google_keep.py setup` — sometimes Google invalidates the master token.
- Use **Copy as text** until upstream fixes it.
