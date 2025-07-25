#!/usr/bin/env node

/**
 * Trading Bot Configuration Validator
 * Validates all configurations needed for production trading
 */

const fs = require('fs')
const path = require('path')

function validateConfig() {
  console.log('🔍 Validating Trading Bot Configuration...\n')

  const envFile = path.join(process.cwd(), '.env.local')
  const hasEnvFile = fs.existsSync(envFile)

  if (!hasEnvFile) {
    console.error('❌ .env.local file not found!')
    console.error('   Please copy .env.example to .env.local and configure your settings\n')
    process.exit(1)
  }

  // Load environment variables
  require('dotenv').config({ path: envFile })

  const validationResults = {
    rpcEndpoints: validateRpcEndpoints(),
    walletKeys: validateWalletKeys(),
    tradingConfig: validateTradingConfig(),
    riskManagement: validateRiskManagement(),
    infrastructure: validateInfrastructure()
  }

  // Print summary
  console.log('\n📊 Configuration Validation Summary:')
  console.log('='*50)
  
  Object.entries(validationResults).forEach(([category, result]) => {
    const icon = result.valid ? '✅' : '❌'
    console.log(`${icon} ${category}: ${result.message}`)
    
    if (result.warnings?.length > 0) {
      result.warnings.forEach(warning => {
        console.log(`   ⚠️  ${warning}`)
      })
    }
    
    if (result.errors?.length > 0) {
      result.errors.forEach(error => {
        console.log(`   ❌ ${error}`)
      })
    }
  })

  const allValid = Object.values(validationResults).every(r => r.valid)
  
  if (allValid) {
    console.log('\n🎉 All configurations are valid! Ready for trading.')
  } else {
    console.log('\n⚠️  Some configurations need attention before trading.')
    process.exit(1)
  }
}

function validateRpcEndpoints() {
  const required = ['QUIKNODE_SOLANA_RPC']
  const optional = ['QUIKNODE_OPTIMISM_RPC', 'QUIKNODE_POLYGON_RPC', 'QUIKNODE_BSC_RPC']
  
  const missing = required.filter(key => !process.env[key] || process.env[key].includes('your-'))
  const warnings = []
  
  if (missing.length > 0) {
    return {
      valid: false,
      message: 'Missing required RPC endpoints',
      errors: missing.map(key => `${key} is required`)
    }
  }
  
  // Check optional endpoints
  const missingOptional = optional.filter(key => !process.env[key] || process.env[key].includes('your-'))
  if (missingOptional.length > 0) {
    warnings.push(`Optional RPC endpoints not configured: ${missingOptional.join(', ')}`)
  }
  
  return {
    valid: true,
    message: 'RPC endpoints configured',
    warnings
  }
}

function validateWalletKeys() {
  const requiredWallets = ['SOLANA_PRIVATE_KEY']
  const optionalWallets = ['POLYGON_PRIVATE_KEY', 'OPTIMISM_PRIVATE_KEY', 'BSC_PRIVATE_KEY']
  
  const missing = requiredWallets.filter(key => !process.env[key] || process.env[key].includes('your-'))
  const warnings = []
  
  if (missing.length > 0) {
    return {
      valid: false,
      message: 'Missing required wallet private keys',
      errors: missing.map(key => `${key} is required for trading`)
    }
  }
  
  // Check optional wallets
  const missingOptional = optionalWallets.filter(key => !process.env[key] || process.env[key].includes('your-'))
  if (missingOptional.length > 0) {
    warnings.push(`Optional wallet keys not configured: ${missingOptional.join(', ')}`)
  }
  
  // Validate key formats
  const solanaKey = process.env.SOLANA_PRIVATE_KEY
  if (solanaKey && !solanaKey.startsWith('[') && solanaKey.length < 40) {
    warnings.push('Solana private key format may be incorrect')
  }
  
  return {
    valid: true,
    message: 'Wallet keys configured',
    warnings
  }
}

function validateTradingConfig() {
  const requiredConfig = {
    'TRADING_BOT_ENABLED': 'true',
    'PRODUCTION_BOT_ENABLED': ['true', 'false'],
    'MAX_TRADES_PER_DAY': (val) => !isNaN(val) && parseInt(val) > 0,
    'DEFAULT_INVESTMENT_AMOUNT': (val) => !isNaN(val) && parseFloat(val) > 0
  }
  
  const errors = []
  const warnings = []
  
  Object.entries(requiredConfig).forEach(([key, validator]) => {
    const value = process.env[key]
    
    if (!value) {
      errors.push(`${key} is required`)
      return
    }
    
    if (Array.isArray(validator)) {
      if (!validator.includes(value)) {
        errors.push(`${key} must be one of: ${validator.join(', ')}`)
      }
    } else if (typeof validator === 'function') {
      if (!validator(value)) {
        errors.push(`${key} has invalid value: ${value}`)
      }
    } else if (validator !== value) {
      errors.push(`${key} must be: ${validator}`)
    }
  })
  
  // Safety checks
  if (process.env.PRODUCTION_BOT_ENABLED === 'true') {
    warnings.push('Production bot is ENABLED - ensure you are ready for live trading')
  }
  
  const maxTrades = parseInt(process.env.MAX_TRADES_PER_DAY || '0')
  if (maxTrades > 100) {
    warnings.push('MAX_TRADES_PER_DAY is very high - consider risk management')
  }
  
  return {
    valid: errors.length === 0,
    message: errors.length === 0 ? 'Trading configuration valid' : 'Trading configuration has errors',
    errors,
    warnings
  }
}

function validateRiskManagement() {
  const riskConfig = {
    'STOP_LOSS_PERCENTAGE': { min: 1, max: 50, default: 8 },
    'TAKE_PROFIT_PERCENTAGE': { min: 1, max: 100, default: 12 },
    'MAX_SLIPPAGE_TOLERANCE': { min: 0.1, max: 20, default: 5 },
    'MAX_INVESTMENT_PER_TRADE': { min: 1, max: 10000, default: 500 }
  }
  
  const errors = []
  const warnings = []
  
  // Validate each risk parameter
  Object.entries(riskConfig).forEach(([key, config]) => {
    const envValue = process.env[key]
    const value = parseFloat(envValue || config.default.toString())
    
    // Check if the environment variable is set but not numeric
    if (envValue && isNaN(parseFloat(envValue))) {
      errors.push(`${key} is not a valid number: "${envValue}"`)
      return
    }
    
    // Check if the value is within acceptable range
    if (isNaN(value) || value < config.min || value > config.max) {
      errors.push(`${key} must be between ${config.min} and ${config.max} (current: ${value})`)
    }
  })
  
  // Additional risk analysis (only if no parsing errors)
  if (errors.length === 0) {
    const stopLoss = parseFloat(process.env.STOP_LOSS_PERCENTAGE || '8')
    const takeProfit = parseFloat(process.env.TAKE_PROFIT_PERCENTAGE || '12')
    const maxInvestment = parseFloat(process.env.MAX_INVESTMENT_PER_TRADE || '500')
    
    console.log('\n📊 Risk Assessment:')
    console.log(`   Stop Loss: ${stopLoss}% ${stopLoss > 15 ? '⚠️  High risk!' : '✅'}`)
    console.log(`   Take Profit: ${takeProfit}% ${takeProfit < 10 ? '⚠️  Low target!' : '✅'}`)
    console.log(`   Max Investment: $${maxInvestment} ${maxInvestment > 1000 ? '⚠️  High exposure!' : '✅'}`)
    
    if (stopLoss > 20) {
      warnings.push('Stop loss > 20% is very high risk')
    }
    
    if (takeProfit < stopLoss) {
      warnings.push('Take profit should be higher than stop loss')
    }
    
    if (maxInvestment > 1000) {
      warnings.push('Max investment per trade > $1000 represents high capital exposure')
    }
  }
  
  return {
    valid: errors.length === 0,
    message: errors.length === 0 ? 'Risk management configured' : 'Risk management has errors',
    errors,
    warnings
  }
}

function validateInfrastructure() {
  const warnings = []
  
  // Optional but recommended for production
  const recommended = ['SENTRY_DSN', 'LOG_LEVEL', 'JWT_SECRET']
  const missing = recommended.filter(key => !process.env[key] || process.env[key].includes('your-'))
  
  if (missing.length > 0) {
    warnings.push(`Recommended for production: ${missing.join(', ')}`)
  }
  
  // Database warning
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('username:password')) {
    warnings.push('DATABASE_URL not configured - trading data will not persist')
  }
  
  return {
    valid: true, // Infrastructure is optional for basic functionality
    message: 'Infrastructure checks completed',
    warnings
  }
}

// Run validation if called directly
if (require.main === module) {
  validateConfig()
}

module.exports = { validateConfig }