#!/usr/bin/env node

/**
 * Bot Monitoring Script
 * Run this to monitor your trading bot status and debug issues
 */

const fetch = require('node-fetch')

const API_BASE = process.env.API_BASE || 'http://localhost:3001'

async function checkBotStatus(botType = 'trading-bot') {
  try {
    console.log(`\n🔍 Checking ${botType} status...`)
    
    const response = await fetch(`${API_BASE}/api/${botType}/status`)
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch status: ${response.status} ${response.statusText}`)
      return false
    }
    
    const data = await response.json()
    
    console.log(`📊 Bot Status:`)
    console.log(`   - Running: ${data.status?.isRunning ? '✅' : '❌'}`)
    console.log(`   - Active Trades: ${data.status?.activeTrades || 0}`)
    console.log(`   - Completed Trades: ${data.status?.completedTrades || 0}`)
    
    if (data.stats) {
      console.log(`💰 Stats:`)
      console.log(`   - Total Profit: $${data.stats.totalProfit?.toFixed(2) || '0'}`)
      console.log(`   - Success Rate: ${data.stats.successRate?.toFixed(1) || '0'}%`)
      console.log(`   - Total Trades: ${(data.stats.successfulTrades || 0) + (data.stats.failedTrades || 0)}`)
      console.log(`   - Active Trades: ${data.stats.activeTrades || 0}`)
    }
    
    return data.status?.isRunning
    
  } catch (error) {
    console.error(`❌ Error checking bot status:`, error.message)
    return false
  }
}

async function startBot(botType = 'trading-bot') {
  try {
    console.log(`\n🚀 Starting ${botType}...`)
    
    const response = await fetch(`${API_BASE}/api/${botType}/start`, {
      method: 'POST',
    })
    
    if (!response.ok) {
      console.error(`❌ Failed to start bot: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.error(`Error details: ${errorText}`)
      return false
    }
    
    const data = await response.json()
    console.log(`✅ ${data.message}`)
    return true
    
  } catch (error) {
    console.error(`❌ Error starting bot:`, error.message)
    return false
  }
}

async function stopBot(botType = 'trading-bot') {
  try {
    console.log(`\n🛑 Stopping ${botType}...`)
    
    const response = await fetch(`${API_BASE}/api/${botType}/stop`, {
      method: 'POST',
    })
    
    if (!response.ok) {
      console.error(`❌ Failed to stop bot: ${response.status} ${response.statusText}`)
      return false
    }
    
    const data = await response.json()
    console.log(`✅ ${data.message}`)
    return true
    
  } catch (error) {
    console.error(`❌ Error stopping bot:`, error.message)
    return false
  }
}

async function monitorBots() {
  console.log('🤖 Trading Bot Monitor')
  console.log('='.repeat(50))
  
  // Check both bots
  const tradingBotRunning = await checkBotStatus('trading-bot')
  const productionBotRunning = await checkBotStatus('production-bot')
  
  console.log(`\n📈 Summary:`)
  console.log(`   - Trading Bot: ${tradingBotRunning ? 'Running ✅' : 'Stopped ❌'}`)
  console.log(`   - Production Bot: ${productionBotRunning ? 'Running ✅' : 'Stopped ❌'}`)
  
  if (!tradingBotRunning && !productionBotRunning) {
    console.log(`\n⚠️  No bots are running. Use 'node scripts/monitor-bot.js start' to start them.`)
  }
}

async function main() {
  const command = process.argv[2]
  const botType = process.argv[3] || 'trading-bot'
  
  switch (command) {
    case 'start':
      if (botType === 'all') {
        await startBot('trading-bot')
        await startBot('production-bot')
      } else {
        await startBot(botType)
      }
      break
      
    case 'stop':
      if (botType === 'all') {
        await stopBot('trading-bot')
        await stopBot('production-bot')
      } else {
        await stopBot(botType)
      }
      break
      
    case 'restart':
      if (botType === 'all') {
        await stopBot('trading-bot')
        await stopBot('production-bot')
        await new Promise(resolve => setTimeout(resolve, 2000))
        await startBot('trading-bot')
        await startBot('production-bot')
      } else {
        await stopBot(botType)
        await new Promise(resolve => setTimeout(resolve, 2000))
        await startBot(botType)
      }
      break
      
    case 'status':
    default:
      await monitorBots()
      break
  }
}

// Add process handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { checkBotStatus, startBot, stopBot, monitorBots }