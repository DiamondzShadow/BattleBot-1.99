# Environment Setup Guide - Fixing Configuration Errors

## Understanding the Error

Your friend is experiencing a configuration mismatch issue. Here's what's happening:

### The Problem

1. **First script (`pnpm run validate`)** shows that `QUIKNODE_OPTIMISM_RPC` is configured ✅
2. **Second script (`pnpm run test:endpoints`)** says `QUIKNODE_OPTIMISM_RPC` is missing ❌

This happens because the two scripts are looking for environment variables differently:
- The validation script uses `dotenv` to load from `.env.local`
- The test-endpoints script relies on the environment variables being already loaded

## Quick Fix

The issue is that the `test-endpoints.js` script doesn't load the `.env.local` file. Here's how to fix it:

### Option 1: Update the test-endpoints.js script (Recommended)

Add this line at the top of `scripts/test-endpoints.js` after the imports:

```javascript
require('dotenv').config({ path: '.env.local' })
```

### Option 2: Use a package.json script that loads env vars

Update the script in `package.json` to:

```json
"test:endpoints": "node -r dotenv/config scripts/test-endpoints.js dotenv_config_path=.env.local"
```

## Complete Setup Instructions

### Step 1: Create Your Environment File

1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` in VS Code

### Step 2: Get Your QuickNode Endpoints

1. Go to [QuickNode.com](https://quicknode.com/)
2. Sign up for a free account
3. Create endpoints for:
   - Solana
   - Polygon  
   - BSC (Binance Smart Chain)
   - Optimism

4. Copy each endpoint URL and paste it into your `.env.local` file

### Step 3: Essential Variables to Set

At minimum, you need these for the bot to work:

```env
# QuickNode RPC Endpoints
QUIKNODE_SOLANA_RPC=https://your-endpoint.solana-mainnet.quiknode.pro/your-key/
QUIKNODE_POLYGON_RPC=https://your-endpoint.polygon.quiknode.pro/your-key/
QUIKNODE_BSC_RPC=https://your-endpoint.bsc.quiknode.pro/your-key/
QUIKNODE_OPTIMISM_RPC=https://your-endpoint.optimism.quiknode.pro/your-key/

# Jupiter API (leave as is)
JUPITER_SWAP_API=https://quote-api.jup.ag/v6

# Your Solana Wallet Private Key (for trading)
SOLANA_PRIVATE_KEY=your_private_key_here

# Trading Configuration
TRADING_BOT_ENABLED=true
PRODUCTION_BOT_ENABLED=false  # Keep false for testing
```

### Step 4: Fix the Scripts

Edit `scripts/test-endpoints.js` and add this after line 8:

```javascript
// Load environment variables
require('dotenv').config({ path: '.env.local' })
```

### Step 5: Test Your Setup

Run these commands in order:

```bash
# Install dependencies if not done already
pnpm install

# Validate configuration
pnpm run validate

# Test endpoints (should work now)
pnpm run test:endpoints
```

## Common Issues

### "Missing required environment variables" Error
- Make sure `.env.local` exists (not just `.env.example`)
- Check that you've filled in actual values, not placeholder text
- Ensure there are no spaces around the `=` sign in your env file

### "MODULE_NOT_FOUND" Error for dotenv
- Run `pnpm install dotenv` to ensure it's installed

### Variables Still Not Loading
- Check file name is exactly `.env.local` (not `.env` or `.env.local.txt`)
- Make sure you're in the project root directory when running commands
- On Windows, ensure line endings are correct (LF not CRLF)

## Security Reminder

⚠️ **NEVER** commit your `.env.local` file to Git!
- It contains sensitive API keys and private keys
- The `.gitignore` file should already exclude it
- Only share the `.env.example` file with others

## Need More Help?

1. Double-check all RPC URLs are complete (including the key part)
2. Make sure Jupiter API URL is exactly: `https://quote-api.jup.ag/v6`
3. For testing, you can leave notification services (Discord, Telegram) empty
4. The bot will run in development mode by default (no real trades)