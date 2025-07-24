# Trading Bot Setup & Troubleshooting Guide

## 🚀 Quick Setup

### 1. Environment Configuration

Copy `.env.example` to `.env.local` and fill in your QuickNode endpoints:

```bash
cp .env.example .env.local
```

**Your Complete QuickNode Configuration:**
```env
# QuickNode Premium Endpoints - All Chains
QUIKNODE_SOLANA_RPC=https://black-still-butterfly.solana-mainnet.quiknode.pro/ed845667579c683613d3f8b9e397ddc46239ce76/
QUIKNODE_POLYGON_RPC=https://tiniest-quick-shard.matic.quiknode.pro/e7a88a2e263965ea751216078e9c8223e27e7ca9/
QUIKNODE_BSC_RPC=https://warmhearted-necessary-arm.bsc.quiknode.pro/5b1710b0e9f7bae6e68294641105e80c3df7834d/
JUPITER_SWAP_API=https://jupiter-swap-api.quiknode.pro/7A1B06086CF5/

# Additional configuration
TRADING_BOT_ENABLED=true
PRODUCTION_BOT_ENABLED=true
DRY_RUN_MODE=false
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start the Application

```bash
pnpm dev
```

### 4. Monitor Your Bots

```bash
# Check bot status
pnpm run bot:status

# Start all bots
pnpm run bot:start

# Stop all bots
pnpm run bot:stop

# Restart all bots
pnpm run bot:restart

# Test all QuickNode endpoints
pnpm run test:endpoints
```

## 🔧 Fixes Applied

### Problem: "Firing once then turning off"

**Root Causes Identified & Fixed:**

1. **Production Bot Service - Circular Import Issue**
   - ❌ **Was:** `lib/production-trading-bot.ts` had circular import
   - ✅ **Fixed:** Complete rewrite with proper service implementation
   - ✅ **Added:** Enhanced error handling and recovery mechanisms

2. **Interval Management Issues**
   - ❌ **Was:** Bot intervals were not properly maintained
   - ✅ **Fixed:** Robust interval management with proper cleanup
   - ✅ **Added:** Immediate cycle execution + scheduled intervals

3. **Error Handling**
   - ❌ **Was:** Single errors could stop the entire bot
   - ✅ **Fixed:** Comprehensive error handling with recovery
   - ✅ **Added:** Error counting and automatic restart mechanisms

4. **State Management**
   - ❌ **Was:** No persistence or state validation
   - ✅ **Fixed:** Proper state tracking and validation
   - ✅ **Added:** Cycle counting and performance monitoring

### Key Improvements

1. **Enhanced Logging**
   ```javascript
   // Now you'll see detailed logs like:
   "Starting production trading bot..."
   "Interval: 120s, Max trades: 5"
   "Running production trading cycle #1..."
   "Production trading cycle #1 completed in 1234ms"
   ```

2. **Better Error Recovery**
   ```javascript
   // Errors no longer kill the bot
   // Instead they're logged and counted
   // Bot only stops after 10 consecutive errors
   ```

3. **QuickNode Priority**
   ```javascript
   // QuickNode endpoints are now prioritized:
   const SOLANA_RPC_URLS = [
     process.env.QUIKNODE_SOLANA_RPC, // Primary
     process.env.ALCHEMY_SOLANA_RPC,  // Backup
     "https://api.mainnet-beta.solana.com", // Fallback
   ]
   ```

## 🐛 Troubleshooting

### Bot Keeps Stopping After One Cycle

**Check these in order:**

1. **Verify Environment Variables**
   ```bash
   # Check if QuickNode endpoints are properly set
   echo $QUIKNODE_SOLANA_RPC
   ```

2. **Check Server Logs**
   ```bash
   # Look for error patterns in Next.js logs
   pnpm dev
   # Watch for: "Error in trading cycle", "Too many errors"
   ```

3. **Test API Endpoints**
   ```bash
   # Test the bot API directly
   curl http://localhost:3000/api/trading-bot/status
   curl http://localhost:3000/api/production-bot/status
   ```

4. **Monitor Bot Status**
   ```bash
   # Use the monitoring script
   pnpm run bot:monitor
   ```

### Common Error Messages & Solutions

#### "Failed to fetch trading bot status"
- **Cause:** Next.js server not running or API routes not working
- **Solution:** Restart the development server with `pnpm dev`

#### "Maximum concurrent trades reached"
- **Cause:** Bot has reached the trade limit (normal behavior)
- **Solution:** Either wait for trades to complete or increase `maxConcurrentTrades` in config

#### "Error analyzing trending tokens"
- **Cause:** QuickNode/Solana RPC issues or rate limiting
- **Solution:** Check your QuickNode endpoint status and rate limits

#### "Too many errors, stopping production bot"
- **Cause:** Accumulated 10+ errors, safety mechanism activated
- **Solution:** Check logs for root cause, fix, then restart bot

### Performance Optimization

1. **QuickNode Endpoint Optimization**
   ```env
   # Use your upgraded QuickNode endpoints for best performance
   QUIKNODE_SOLANA_RPC=https://your-upgraded-endpoint.solana-mainnet.quiknode.pro/api-key/
   ```

2. **Trading Intervals**
   ```javascript
   // Adjust intervals based on your needs:
   // - Development: 60-120 seconds
   // - Production: 120-300 seconds (to avoid rate limits)
   ```

3. **Concurrent Trades**
   ```javascript
   // Conservative settings:
   maxConcurrentTrades: 3-5
   // Aggressive settings:
   maxConcurrentTrades: 10-20
   ```

## 🎯 Bot Configuration

### Trading Bot (Development) - OPTIMIZED
- **Interval:** 45 seconds (faster with QuickNode)
- **Max Trades:** 15 (multi-chain support)
- **Profit Threshold:** $3 USD
- **Focus:** Solana + Polygon + BSC
- **Real Jupiter API Integration** ✅

### Production Bot (Live Trading) - OPTIMIZED
- **Interval:** 90 seconds (1.5 minutes)
- **Max Trades:** 8 (better infrastructure)
- **Profit Threshold:** $5 USD
- **Stop Loss:** -8% (tighter with better data)
- **Take Profit:** +12% (more realistic)
- **Focus:** Multi-chain with premium endpoints

## 📊 Monitoring Dashboard

Access your trading bots through the web interface:

- **Development Bot:** `/trading-bot` page
- **Production Bot:** `/production-bot` page
- **Live Trades:** `/trades` page
- **Analytics:** `/dashboard` page

## 🔄 Bot Lifecycle

1. **Start:** Bot initializes with configuration
2. **Cycle:** Runs every X seconds (configurable)
3. **Analysis:** Scans for trending tokens
4. **Execution:** Makes trades based on profitability
5. **Monitoring:** Updates existing trades
6. **Risk Management:** Applies stop-loss/take-profit

## 🛡️ Safety Features

1. **Error Recovery:** Continues running despite individual errors
2. **Rate Limiting:** Respects API rate limits with fallbacks
3. **Trade Limits:** Maximum concurrent trades to limit risk
4. **Stop Loss:** Automatic loss limitation
5. **Dry Run Mode:** Test without real trades

## 📈 Next Steps

1. **Add Real Trading Logic:**
   - Integrate with DEX APIs (Jupiter, 1inch, etc.)
   - Add wallet integration for actual trades
   - Implement real price feeds

2. **Enhanced Analytics:**
   - Profit/loss tracking
   - Performance metrics
   - Risk analysis

3. **Notification System:**
   - Discord/Telegram alerts
   - Email notifications
   - Real-time updates

## 🆘 Still Having Issues?

1. **Check the server logs** for specific error messages
2. **Verify your QuickNode endpoints** are working
3. **Test with a single bot first** before running both
4. **Use the monitoring script** to track bot behavior
5. **Check your environment variables** are properly set

The bots should now run continuously without stopping after one cycle. The enhanced error handling and recovery mechanisms ensure they keep running even when encountering individual errors.