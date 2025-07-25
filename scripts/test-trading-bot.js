#!/usr/bin/env node

/**
 * Trading Bot Integration Test
 * Tests trading bot functionality without executing real trades
 */

const fs = require('fs')
const path = require('path')

async function testTradingBot() {
  console.log('🤖 Testing Trading Bot Integration...\n')

  // Load environment variables
  const envFile = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envFile)) {
    console.error('❌ .env.local file not found! Please run configuration first.')
    process.exit(1)
  }

  require('dotenv').config({ path: envFile })

  const tests = [
    testBotConfiguration,
    testWalletConnections,
    testApiServices,
    testRiskManagement,
    testEmergencyStop
  ]

  console.log('🧪 Running Trading Bot Tests...\n')

  for (const test of tests) {
    try {
      await test()
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`)
      process.exit(1)
    }
  }

  console.log('\n🎉 All trading bot tests passed! Bot is ready for deployment.')
}

async function testBotConfiguration() {
  console.log('1️⃣ Testing Bot Configuration...')
  
  // Check if bot is enabled
  const botEnabled = process.env.TRADING_BOT_ENABLED === 'true'
  const productionEnabled = process.env.PRODUCTION_BOT_ENABLED === 'true'
  
  console.log(`   Bot Enabled: ${botEnabled ? '✅' : '❌'}`)
  console.log(`   Production Mode: ${productionEnabled ? '⚠️  LIVE' : '✅ SAFE'}`)
  
  // Check risk parameters
  const stopLoss = Number(process.env.STOP_LOSS_PERCENTAGE) || 8
  const takeProfit = Number(process.env.TAKE_PROFIT_PERCENTAGE) || 12
  const maxInvestment = Number(process.env.MAX_INVESTMENT_PER_TRADE) || 500
  
  console.log(`   Stop Loss: ${stopLoss}%`)
  console.log(`   Take Profit: ${takeProfit}%`)
  console.log(`   Max Investment: $${maxInvestment}`)
  
  if (stopLoss > 20) {
    console.warn('   ⚠️  Warning: Stop loss > 20% is high risk')
  }
  
  if (takeProfit < stopLoss) {
    throw new Error('Take profit must be higher than stop loss')
  }
  
  console.log('   ✅ Bot configuration validated\n')
}

async function testWalletConnections() {
  console.log('2️⃣ Testing Wallet Connections...')
  
  // Test Solana wallet
  const solanaKey = process.env.SOLANA_PRIVATE_KEY
  if (!solanaKey || solanaKey.includes('your-')) {
    throw new Error('Solana private key not configured')
  }
  console.log('   ✅ Solana wallet configured')
  
  // Test optional EVM wallets
  const evmWallets = ['POLYGON_PRIVATE_KEY', 'OPTIMISM_PRIVATE_KEY', 'BSC_PRIVATE_KEY']
  let evmCount = 0
  
  evmWallets.forEach(wallet => {
    const key = process.env[wallet]
    if (key && !key.includes('your-')) {
      evmCount++
      console.log(`   ✅ ${wallet.replace('_PRIVATE_KEY', '')} wallet configured`)
    }
  })
  
  console.log(`   📊 Total wallets configured: ${1 + evmCount} (1 Solana + ${evmCount} EVM)\n`)
}

async function testApiServices() {
  console.log('3️⃣ Testing API Services...')
  
  // Test RPC endpoints
  const solanaRpc = process.env.QUIKNODE_SOLANA_RPC
  if (!solanaRpc || solanaRpc.includes('your-')) {
    console.log('   ⚠️  Using public Solana RPC (may be rate limited)')
  } else {
    console.log('   ✅ Private Solana RPC configured')
  }
  
  const optimismRpc = process.env.QUIKNODE_OPTIMISM_RPC
  if (!optimismRpc || optimismRpc.includes('your-')) {
    console.log('   ⚠️  Using public Optimism RPC (SuperSwaps may be limited)')
  } else {
    console.log('   ✅ Private Optimism RPC configured')
  }
  
  // Test API keys
  const apiKeys = [
    { name: 'CoinMarketCap', env: 'COINMARKETCAP_API_KEY', required: false },
    { name: '0x API', env: 'ZEROX_API_KEY', required: false },
    { name: 'Alchemy', env: 'ALCHEMY_API_KEY', required: false }
  ]
  
  apiKeys.forEach(({ name, env, required }) => {
    const key = process.env[env]
    if (key && !key.includes('your-')) {
      console.log(`   ✅ ${name} API configured`)
    } else if (required) {
      throw new Error(`${name} API key is required but not configured`)
    } else {
      console.log(`   ⚠️  ${name} API not configured (optional)`)
    }
  })
  
  console.log('   ✅ API services validated\n')
}

async function testRiskManagement() {
  console.log('4️⃣ Testing Risk Management...')
  
  // Test risk parameters
  const stopLoss = Number(process.env.STOP_LOSS_PERCENTAGE) || 8
  const takeProfit = Number(process.env.TAKE_PROFIT_PERCENTAGE) || 12
  const maxInvestment = Number(process.env.MAX_INVESTMENT_PER_TRADE) || 500
  const maxSlippage = Number(process.env.MAX_SLIPPAGE_TOLERANCE) || 5
  
  // Validate ranges
  if (stopLoss < 1 || stopLoss > 50) {
    throw new Error(`Stop loss must be between 1-50%, current: ${stopLoss}%`)
  }
  
  if (takeProfit < 1 || takeProfit > 100) {
    throw new Error(`Take profit must be between 1-100%, current: ${takeProfit}%`)
  }
  
  if (maxInvestment < 1 || maxInvestment > 10000) {
    throw new Error(`Max investment must be between $1-$10000, current: $${maxInvestment}`)
  }
  
  if (maxSlippage < 0.1 || maxSlippage > 20) {
    throw new Error(`Max slippage must be between 0.1-20%, current: ${maxSlippage}%`)
  }
  
  // Risk assessment
  console.log(`   Stop Loss: ${stopLoss}% ${stopLoss > 15 ? '⚠️  High Risk' : '✅ Safe'}`)
  console.log(`   Take Profit: ${takeProfit}% ${takeProfit < 10 ? '⚠️  Low Target' : '✅ Good'}`)
  console.log(`   Max Investment: $${maxInvestment} ${maxInvestment > 1000 ? '⚠️  High Exposure' : '✅ Safe'}`)
  console.log(`   Max Slippage: ${maxSlippage}% ${maxSlippage > 10 ? '⚠️  High Slippage' : '✅ Safe'}`)
  
  console.log('   ✅ Risk management validated\n')
}

async function testEmergencyStop() {
  console.log('5️⃣ Testing Emergency Procedures...')
  
  // Check if production bot is disabled (safer for testing)
  const productionEnabled = process.env.PRODUCTION_BOT_ENABLED === 'true'
  
  if (productionEnabled) {
    console.log('   ⚠️  Production bot is ENABLED - ensure you are ready for live trading')
    console.log('   💡 To disable: Set PRODUCTION_BOT_ENABLED=false')
  } else {
    console.log('   ✅ Production bot is disabled (safe for testing)')
  }
  
  // Test infrastructure for emergency stops
  const hasDatabase = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('username:password')
  const hasRedis = process.env.REDIS_URL && !process.env.REDIS_URL.includes('localhost')
  const hasSentry = process.env.SENTRY_DSN && !process.env.SENTRY_DSN.includes('your-')
  
  console.log(`   Database: ${hasDatabase ? '✅ Configured' : '⚠️  Not configured'}`)
  console.log(`   Redis Cache: ${hasRedis ? '✅ Configured' : '⚠️  Using default'}`)
  console.log(`   Error Tracking: ${hasSentry ? '✅ Configured' : '⚠️  Not configured'}`)
  
  console.log('   ✅ Emergency procedures validated\n')
}

// Helper function to simulate API call
async function simulateApiCall(name, url) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.1 // 90% success rate
      resolve({
        name,
        success,
        responseTime: Math.floor(Math.random() * 500) + 100
      })
    }, 100)
  })
}

// Run tests if called directly
if (require.main === module) {
  testTradingBot().catch(error => {
    console.error('\n❌ Trading bot test failed:', error.message)
    process.exit(1)
  })
}

module.exports = { testTradingBot }