#!/usr/bin/env python3
"""
Google Keep Shopping List Integration

This script sends shopping lists to Google Keep using the unofficial gkeepapi library.

Setup:
1. Install dependencies: pip install gkeepapi keyring
2. Run setup: python google_keep.py setup
3. Follow prompts to authenticate

Usage:
    python google_keep.py setup              # Initial authentication setup
    python google_keep.py send <json_file>   # Send shopping list from JSON file
    python google_keep.py test               # Test connection
"""

import sys
import json
import argparse
import getpass
from datetime import datetime
from pathlib import Path

try:
    import gkeepapi
    import keyring
except ImportError:
    print("Error: Required packages not installed.")
    print("Please run: pip install gkeepapi keyring")
    sys.exit(1)


# Constants
SERVICE_NAME = "recipe-manager-gkeep"
MASTER_TOKEN_KEY = "master_token"
EMAIL_KEY = "email"
CONFIG_FILE = Path(__file__).parent / ".gkeep_config.json"


def get_stored_credentials():
    """Retrieve stored credentials from keyring and config file."""
    if not CONFIG_FILE.exists():
        return None, None
    
    try:
        with open(CONFIG_FILE, 'r') as f:
            config = json.load(f)
            email = config.get('email')
    except (json.JSONDecodeError, IOError):
        return None, None
    
    if not email:
        return None, None
    
    master_token = keyring.get_password(SERVICE_NAME, MASTER_TOKEN_KEY)
    return email, master_token


def store_credentials(email: str, master_token: str):
    """Store credentials securely."""
    # Store email in config file
    with open(CONFIG_FILE, 'w') as f:
        json.dump({'email': email}, f)
    
    # Store master token in system keyring
    keyring.set_password(SERVICE_NAME, MASTER_TOKEN_KEY, master_token)
    print(f"✓ Credentials stored securely")


def get_keep_client():
    """Get an authenticated Google Keep client."""
    email, master_token = get_stored_credentials()
    
    if not email or not master_token:
        print("Error: Not authenticated. Please run 'python google_keep.py setup' first.")
        sys.exit(1)
    
    keep = gkeepapi.Keep()
    
    try:
        keep.authenticate(email, master_token)
        return keep
    except gkeepapi.exception.LoginException as e:
        print(f"Error: Authentication failed - {e}")
        print("Please run 'python google_keep.py setup' to re-authenticate.")
        sys.exit(1)


def setup_authentication():
    """Interactive setup for Google Keep authentication."""
    print("=" * 50)
    print("Google Keep Authentication Setup")
    print("=" * 50)
    print()
    print("This will set up authentication for Google Keep.")
    print("You'll need to generate a master token for your Google account.")
    print()
    print("IMPORTANT: If you have 2-Factor Authentication enabled,")
    print("you'll need to generate an App Password:")
    print("  1. Go to https://myaccount.google.com/apppasswords")
    print("  2. Create a new app password for 'Mail' or custom app")
    print("  3. Use that password below instead of your regular password")
    print()
    
    email = input("Enter your Google email: ").strip()
    if not email:
        print("Error: Email is required")
        sys.exit(1)
    
    password = getpass.getpass("Enter your password (or app password): ")
    if not password:
        print("Error: Password is required")
        sys.exit(1)
    
    print()
    print("Authenticating with Google Keep...")
    
    keep = gkeepapi.Keep()
    
    try:
        # Try to login and get master token
        keep.login(email, password)
        master_token = keep.getMasterToken()
        
        # Store credentials securely
        store_credentials(email, master_token)
        
        print()
        print("✓ Authentication successful!")
        print("✓ Master token stored securely in system keyring")
        print()
        print("You can now use the script to send shopping lists to Google Keep.")
        
    except gkeepapi.exception.LoginException as e:
        print()
        print(f"✗ Authentication failed: {e}")
        print()
        print("Troubleshooting tips:")
        print("  - If you have 2FA enabled, use an App Password")
        print("  - Try visiting https://accounts.google.com/b/0/DisplayUnlockCaptcha")
        print("  - Make sure your email and password are correct")
        sys.exit(1)


def test_connection():
    """Test the Google Keep connection."""
    print("Testing Google Keep connection...")
    
    keep = get_keep_client()
    keep.sync()
    
    # Count notes
    notes = list(keep.all())
    print(f"✓ Connection successful!")
    print(f"✓ Found {len(notes)} notes in your account")


def send_shopping_list(json_file: str):
    """Send a shopping list to Google Keep."""
    # Read the JSON file
    try:
        with open(json_file, 'r') as f:
            data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error reading JSON file: {e}")
        sys.exit(1)
    
    title = data.get('title', 'Shopping List')
    ingredients = data.get('ingredients', [])
    
    if not ingredients:
        print("Error: No ingredients in the shopping list")
        sys.exit(1)
    
    print(f"Sending shopping list: {title}")
    print(f"Items: {len(ingredients)}")
    
    # Format items for Google Keep list
    list_items = []
    for item in ingredients:
        qty = item.get('quantity', '')
        unit = item.get('unit', '')
        name = item.get('name', '')
        
        # Build the item text
        parts = []
        if qty:
            parts.append(qty)
        if unit:
            parts.append(unit)
        if name:
            parts.append(name)
        
        item_text = ' '.join(parts)
        if item_text:
            list_items.append((item_text, False))  # False = unchecked
    
    # Get Keep client and create list
    keep = get_keep_client()
    
    # Create a new list note
    glist = keep.createList(title, list_items)
    
    # Optionally pin it
    glist.pinned = True
    
    # Sync changes
    keep.sync()
    
    print()
    print("✓ Shopping list sent to Google Keep!")
    print(f"✓ Note ID: {glist.id}")
    print(f"✓ Items added: {len(list_items)}")
    
    # Return success data as JSON for the Node.js API to parse
    result = {
        'success': True,
        'noteId': glist.id,
        'title': title,
        'itemCount': len(list_items)
    }
    
    # Print JSON result on a separate line for parsing
    print()
    print("RESULT_JSON:" + json.dumps(result))


def main():
    parser = argparse.ArgumentParser(
        description='Google Keep Shopping List Integration',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python google_keep.py setup              # Set up authentication
  python google_keep.py test               # Test connection
  python google_keep.py send list.json     # Send shopping list
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Command to run')
    
    # Setup command
    subparsers.add_parser('setup', help='Set up Google Keep authentication')
    
    # Test command
    subparsers.add_parser('test', help='Test Google Keep connection')
    
    # Send command
    send_parser = subparsers.add_parser('send', help='Send shopping list to Google Keep')
    send_parser.add_argument('json_file', help='Path to JSON file with shopping list')
    
    args = parser.parse_args()
    
    if args.command == 'setup':
        setup_authentication()
    elif args.command == 'test':
        test_connection()
    elif args.command == 'send':
        send_shopping_list(args.json_file)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == '__main__':
    main()
