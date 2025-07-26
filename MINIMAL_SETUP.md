# 🚀 Minimal Solana Bot Setup Guide

This guide helps you set up the **absolute minimum** required to test a Solana trading bot in your VM.

## 📋 What You Need (Essential Only)

### 1. System Requirements
- **Node.js 18+** (runtime)
- **Git** (version control)
- **2GB RAM** minimum
- **10GB disk space**

### 2. Install Commands
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Clone and setup project
git clone <your-repo-url>
cd <project-directory>
pnpm install
```

### 3. Minimal Configuration
Create `.env.local` with just one required setting:

```env
# Option 1: Free Solana Devnet (for testing)
QUIKNODE_SOLANA_RPC=https://api.devnet.solana.com

# Option 2: QuickNode Free Tier (better performance)
# Get free endpoint at: https://www.quicknode.com/
# QUIKNODE_SOLANA_RPC=https://your-endpoint.solana-mainnet.quiknode.pro/your-key/
```

## 🧪 Test Your Setup

### Step 1: Verify Installation
```bash
# Test minimal Solana connectivity
pnpm test:minimal
```

Expected output:
```
✅ Found Solana RPC endpoint
✅ Connected to Solana
✅ Can fetch blockhash
✅ Minimal Solana bot environment is ready!
```

### Step 2: Run Minimal Bot Example
```bash
# Run the simplified bot (no wallet needed)
pnpm bot:minimal
```

This runs a basic bot that:
- Connects to Solana
- Monitors for opportunities (simulated)
- Shows trade execution flow
- Stops after 5 cycles

## 🔑 What You DON'T Need (Can Skip)

### Advanced Features (Not Required for Testing)
- ❌ Multiple blockchain support (Polygon, BSC, Optimism)
- ❌ AI Trading Signals 
- ❌ MEV Protection
- ❌ SuperSwaps optimization
- ❌ Pump.fun integration
- ❌ Production database
- ❌ Docker/Kubernetes
- ❌ Monitoring dashboards

### Optional Dependencies
- ❌ PostgreSQL/MySQL
- ❌ Redis
- ❌ Grafana/Prometheus
- ❌ Nginx
- ❌ SSL certificates

## 🎯 Minimal Testing Workflow

### 1. Basic Connection Test
```bash
# Just test RPC connection
node -e "
const { Connection } = require('@solana/web3.js');
const conn = new Connection(process.env.QUIKNODE_SOLANA_RPC || 'https://api.devnet.solana.com');
conn.getVersion().then(v => console.log('Connected to Solana:', v));
"
```

### 2. Simple Price Check
```bash
# Check SOL price (requires working RPC)
curl -X POST $QUIKNODE_SOLANA_RPC -H "Content-Type: application/json" -d '
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getBalance",
  "params": ["11111111111111111111111111111111"]
}'
```

### 3. Minimal Bot Features
The minimal bot includes:
- ✅ RPC connection management
- ✅ Basic error handling
- ✅ Trading cycle simulation
- ✅ Profit threshold checking
- ✅ Graceful shutdown (Ctrl+C)

## 🚦 Quick Start Commands

```bash
# 1. Install dependencies
pnpm install

# 2. Copy and configure environment
cp .env.example .env.local
# Edit .env.local - add just QUIKNODE_SOLANA_RPC

# 3. Test connection
pnpm test:minimal

# 4. Run minimal bot
pnpm bot:minimal

# 5. (Optional) Start web UI
pnpm dev
# Visit http://localhost:3000
```

## 🆓 Free RPC Options

### 1. Solana Devnet (Completely Free)
```env
QUIKNODE_SOLANA_RPC=https://api.devnet.solana.com
```
- ✅ No registration required
- ✅ Perfect for testing
- ❌ Not real money/tokens
- ❌ Can be slow

### 2. QuickNode Free Tier
- Sign up at: https://www.quicknode.com/
- ✅ Better performance
- ✅ 10M requests/month free
- ✅ Mainnet access
- ❌ Requires registration

### 3. Other Free Options
- Alchemy: https://www.alchemy.com/
- Ankr: https://www.ankr.com/
- GetBlock: https://getblock.io/

## 📊 Resource Usage

Minimal bot requirements:
- **RAM:** ~200MB
- **CPU:** <5% (1 core)
- **Network:** ~1MB/hour
- **Disk:** ~500MB (with dependencies)

## 🐛 Troubleshooting

### "Cannot find module '@solana/web3.js'"
```bash
pnpm install
```

### "Connection refused" or timeout
Check your RPC endpoint:
```bash
echo $QUIKNODE_SOLANA_RPC
# Should show your RPC URL
```

### "Insufficient funds" error
You're using mainnet - switch to devnet for free testing:
```env
QUIKNODE_SOLANA_RPC=https://api.devnet.solana.com
```

## 🎉 Success!

Once you see the minimal bot running cycles, you have everything needed to:
1. Test Solana connectivity
2. Understand bot architecture  
3. Experiment with trading logic
4. Scale up to production later

**Next steps:**
- Add a wallet for real trades
- Implement actual DEX integration
- Add price feeds
- Enable advanced features as needed