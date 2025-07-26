# 🔐 Wallet Connection Guide for BattleBot 1.99

## 📌 Important: How This Bot Works

**This is NOT a traditional "Connect Wallet" web3 app!** 

Unlike typical DeFi applications where you connect MetaMask or another browser wallet, BattleBot works differently:

- ✅ **Server-side wallet management** - The bot uses private keys stored securely on your server
- ✅ **Automated trading** - No manual transaction approvals needed
- ✅ **Multi-chain support** - Trade across multiple blockchains simultaneously
- ✅ **24/7 operation** - Trades execute even when you're not online

## 🚀 How to Set Up Your Trading Wallets

### Step 1: Create Trading Wallets

You need dedicated wallets for the bot to use. **DO NOT use your main wallets!**

#### For Solana:
```bash
# Using Solana CLI
solana-keygen new --outfile ~/trading-wallet.json

# Or use Phantom wallet:
# 1. Create new wallet in Phantom
# 2. Go to Settings → Security & Privacy → Export Private Key
# 3. Copy the base58 encoded key
```

#### For EVM Chains (Ethereum, Polygon, BSC, etc.):
```bash
# Using ethers.js (Node.js)
node -e "console.log(require('ethers').Wallet.createRandom().privateKey)"

# Or use MetaMask:
# 1. Create new account in MetaMask
# 2. Click three dots → Account details → Export Private Key
# 3. Copy the hex private key (starts with 0x)
```

### Step 2: Configure Your Private Keys

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Add your private keys to `.env.local`:**
   ```env
   # Solana wallet (Required for Solana trading)
   SOLANA_PRIVATE_KEY=5KJvsngHeMpm884c86DknUvLpsKCsi4jVTBFFiVNAaJb...
   
   # EVM wallets (Add only the chains you want to trade on)
   ETHEREUM_PRIVATE_KEY=0x1234567890abcdef...
   POLYGON_PRIVATE_KEY=0x1234567890abcdef...
   BSC_PRIVATE_KEY=0x1234567890abcdef...
   ```

### Step 3: Fund Your Wallets

Before the bot can trade, you need to add funds:

#### Solana:
- Send SOL for gas fees (minimum 0.1 SOL recommended)
- Send USDC or other tokens you want to trade

#### EVM Chains:
- Send native tokens for gas (ETH, MATIC, BNB, etc.)
- Send stablecoins or tokens for trading

### Step 4: Verify Wallet Setup

Run the configuration validator:
```bash
pnpm run validate:config
```

Check wallet status via API:
```bash
# Check all wallet statuses
curl http://localhost:3000/api/wallet/status

# Check wallet balances
curl http://localhost:3000/api/wallet/balances
```

## 🔍 How the Bot Uses Your Wallets

### 1. **Wallet Service Initialization**
When the bot starts, it:
- Loads private keys from environment variables
- Creates wallet instances for each configured chain
- Connects to RPC endpoints

### 2. **Automatic Trading Execution**
The bot:
- Monitors market conditions
- Identifies trading opportunities
- Executes trades automatically using your wallets
- No manual approval needed!

### 3. **Multi-Chain Operations**
- Each chain has its own wallet
- Trades execute independently on each chain
- Bot manages gas fees automatically

## 🛡️ Security Best Practices

### 1. **Use Dedicated Trading Wallets**
- ✅ Create new wallets specifically for the bot
- ❌ Never use your main holding wallets
- ✅ Only fund with amounts you're willing to risk

### 2. **Secure Your Private Keys**
- ✅ Never commit `.env.local` to git
- ✅ Use environment variables in production
- ✅ Enable encryption for stored keys
- ❌ Never share private keys

### 3. **Set Trading Limits**
Configure risk management in `.env.local`:
```env
MAX_INVESTMENT_PER_TRADE=500
DAILY_LOSS_LIMIT=1000
STOP_LOSS_PERCENTAGE=8
```

### 4. **Monitor Your Wallets**
- Check balances regularly
- Review trade history
- Set up alerts for large transactions

## 📊 Viewing Wallet Status in the UI

While the bot doesn't have a traditional "wallet connect" button, you can monitor your wallets:

### 1. **API Endpoints**
- `/api/wallet/status` - Shows configured wallets
- `/api/wallet/balances` - Shows current balances

### 2. **Dashboard Views**
- Trading dashboard shows active trades
- Portfolio page shows holdings per chain
- Bot control shows wallet readiness

### 3. **Example API Response**
```json
{
  "success": true,
  "summary": {
    "availableWallets": 3,
    "totalChains": 7,
    "allWalletsConfigured": false
  },
  "walletStatus": {
    "solana": {
      "available": true,
      "address": "7xKXxY....",
      "provider": "https://api.mainnet-beta.solana.com"
    },
    "ethereum": {
      "available": true,
      "address": "0x742d35Cc...",
      "provider": "https://eth.llamarpc.com"
    }
  }
}
```

## 🚨 Troubleshooting

### "No wallet configured for [chain]"
- Add the private key for that chain to `.env.local`
- Restart the application

### "Insufficient balance"
- Check wallet balance: `curl http://localhost:3000/api/wallet/balances`
- Fund the wallet with native tokens for gas
- Add trading tokens

### "Invalid private key"
- Verify the key format (base58 for Solana, hex for EVM)
- Check for extra spaces or characters
- Ensure the key is complete

### "Transaction failed"
- Check gas balance
- Verify RPC endpoint is working
- Review error logs for details

## 🎯 Next Steps

1. **Start Small**: Test with minimal funds first
2. **Monitor Closely**: Watch the first few trades
3. **Scale Gradually**: Increase limits as you gain confidence
4. **Stay Secure**: Regularly rotate wallets and keys

## ⚡ Quick Commands

```bash
# Validate all configurations
pnpm run validate:config

# Test RPC endpoints
pnpm run test:endpoints

# Check wallet status
curl http://localhost:3000/api/wallet/status

# View wallet balances
curl http://localhost:3000/api/wallet/balances

# Monitor bot activity
pnpm run monitor:bot
```

Remember: This bot trades automatically with your funds. Always start with small amounts and monitor carefully!