#!/usr/bin/env node

/**
 * Configuration Validation Script
 * Checks that all required environment variables are set for the trading bot
 */

const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const REQUIRED_CONFIGS = {
  // Core RPC Endpoints
  'QUIKNODE_SOLANA_RPC': {
    description: 'Solana RPC endpoint from QuickNode',
    critical: true
  },
  
  // Wallet Configuration (Required for Trading)
  'SOLANA_PRIVATE_KEY': {
    description: 'Solana wallet private key',
    critical: true,
    sensitive: true
  },
  
  // Trading Bot Configuration
  'TRADING_BOT_ENABLED': {
    description: 'Enable/disable trading bot',
    critical: true,
    default: 'true'
  },
  'PRODUCTION_BOT_ENABLED': {
    description: 'Enable production mode',
    critical: true,
    default: 'false'
  },
  'MAX_TRADES_PER_DAY': {
    description: 'Maximum trades per day',
    critical: false,
    default: '50'
  },
  'DEFAULT_INVESTMENT_AMOUNT': {
    description: 'Default investment amount in USD',
    critical: false,
    default: '100'
  },
  'MAX_INVESTMENT_PER_TRADE': {
    description: 'Maximum investment per trade in USD',
    critical: true,
    default: '1000'
  },
  
  // Risk Management
  'STOP_LOSS_PERCENTAGE': {
    description: 'Stop loss percentage',
    critical: true,
    default: '8'
  },
  'TAKE_PROFIT_PERCENTAGE': {
    description: 'Take profit percentage',
    critical: true,
    default: '12'
  },
  'MAX_SLIPPAGE_TOLERANCE': {
    description: 'Maximum slippage tolerance',
    critical: true,
    default: '3'
  },
  
  // Infrastructure (Required for Production)
  'DATABASE_URL': {
    description: 'PostgreSQL database URL',
    critical: false,
    production: true
  },
  'REDIS_URL': {
    description: 'Redis cache URL',
    critical: false,
    production: true
  },
  'JWT_SECRET': {
    description: 'JWT secret for authentication',
    critical: false,
    production: true,
    sensitive: true
  },
  'ENCRYPTION_KEY': {
    description: 'Encryption key for sensitive data',
    critical: false,
    production: true,
    sensitive: true
  }
}

const OPTIONAL_CONFIGS = {
  'QUIKNODE_OPTIMISM_RPC': 'Optimism RPC for SuperSwaps',
  'COINMARKETCAP_API_KEY': 'CoinMarketCap API for price data',
  'ZEROX_API_KEY': '0x API for DEX aggregation',
  'ALCHEMY_API_KEY': 'Alchemy backup RPC',
  'DISCORD_WEBHOOK_URL': 'Discord notifications',
  'TELEGRAM_BOT_TOKEN': 'Telegram notifications',
  'SENTRY_DSN': 'Error monitoring'
}

console.log('🔍 BattleBot Configuration Validator\n')

let missingCritical = []
let missingProduction = []
let missingOptional = []
let configuredCount = 0

// Check required configurations
console.log('📋 Checking Required Configurations:\n')

for (const [key, config] of Object.entries(REQUIRED_CONFIGS)) {
  const value = process.env[key]
  const hasValue = value && value.length > 0
  
  if (hasValue) {
    configuredCount++
    if (config.sensitive) {
      console.log(`✅ ${key}: [REDACTED]`)
    } else {
      console.log(`✅ ${key}: ${value}`)
    }
  } else {
    if (config.default) {
      console.log(`⚠️  ${key}: Not set (using default: ${config.default})`)
    } else {
      console.log(`❌ ${key}: Missing - ${config.description}`)
      if (config.critical) {
        missingCritical.push(key)
      } else if (config.production && process.env.NODE_ENV === 'production') {
        missingProduction.push(key)
      }
    }
  }
}

// Check optional configurations
console.log('\n📋 Checking Optional Configurations:\n')

for (const [key, description] of Object.entries(OPTIONAL_CONFIGS)) {
  const value = process.env[key]
  const hasValue = value && value.length > 0
  
  if (hasValue) {
    configuredCount++
    console.log(`✅ ${key}: Configured`)
  } else {
    console.log(`ℹ️  ${key}: Not set - ${description}`)
    missingOptional.push(key)
  }
}

// Summary
console.log('\n' + '='.repeat(50))
console.log('📊 Configuration Summary:\n')

const totalConfigs = Object.keys(REQUIRED_CONFIGS).length + Object.keys(OPTIONAL_CONFIGS).length
console.log(`Total configurations: ${totalConfigs}`)
console.log(`Configured: ${configuredCount}`)
console.log(`Missing critical: ${missingCritical.length}`)
console.log(`Missing production: ${missingProduction.length}`)
console.log(`Missing optional: ${missingOptional.length}`)

// Risk Assessment
console.log('\n🛡️  Risk Assessment:\n')

const stopLoss = parseFloat(process.env.STOP_LOSS_PERCENTAGE || '8')
const takeProfit = parseFloat(process.env.TAKE_PROFIT_PERCENTAGE || '12')
const maxInvestment = parseFloat(process.env.MAX_INVESTMENT_PER_TRADE || '500')

console.log(`Stop Loss: ${stopLoss}% ${stopLoss > 15 ? '⚠️  High risk!' : '✅'}`)
console.log(`Take Profit: ${takeProfit}% ${takeProfit < 10 ? '⚠️  Low target!' : '✅'}`)
console.log(`Max Investment: $${maxInvestment} ${maxInvestment > 1000 ? '⚠️  High exposure!' : '✅'}`)

// Final verdict
console.log('\n' + '='.repeat(50))

if (missingCritical.length > 0) {
  console.log('\n❌ CRITICAL: Missing required configurations!')
  console.log('The trading bot cannot function without:')
  missingCritical.forEach(key => console.log(`  - ${key}`))
  console.log('\nPlease update your .env.local file with these values.')
  process.exit(1)
} else if (process.env.NODE_ENV === 'production' && missingProduction.length > 0) {
  console.log('\n⚠️  WARNING: Missing production configurations!')
  console.log('Production deployment requires:')
  missingProduction.forEach(key => console.log(`  - ${key}`))
  console.log('\nThe bot may not function correctly in production.')
} else {
  console.log('\n✅ Configuration is valid!')
  console.log('The trading bot has all required settings.')
  
  if (missingOptional.length > 0) {
    console.log('\n💡 TIP: Consider adding these optional features:')
    missingOptional.slice(0, 3).forEach(key => console.log(`  - ${key}`))
  }
}

// Check if running with default/demo values
if (!process.env.PRODUCTION_BOT_ENABLED || process.env.PRODUCTION_BOT_ENABLED !== 'true') {
  console.log('\n⚠️  Note: Bot is running in DEVELOPMENT mode.')
  console.log('Set PRODUCTION_BOT_ENABLED=true for live trading.')
}