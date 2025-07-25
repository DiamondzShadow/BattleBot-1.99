#!/usr/bin/env node

/**
 * QuickNode Endpoint Performance Test
 * Tests all configured QuickNode endpoints for connectivity and speed
 */

const fetch = require('node-fetch')

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

// Test QuickNode endpoints and Jupiter API
async function testEndpoints() {
  console.log('🔍 Testing QuickNode Endpoints and APIs...\n')

  // Endpoints - All from environment variables only
  const endpoints = {
    solana: process.env.QUIKNODE_SOLANA_RPC,
    polygon: process.env.QUIKNODE_POLYGON_RPC,
    bsc: process.env.QUIKNODE_BSC_RPC,
    optimism: process.env.QUIKNODE_OPTIMISM_RPC,
    jupiter: process.env.JUPITER_SWAP_API
  }

  // Check if required environment variables are set
  const missingEnvVars = []
  Object.entries(endpoints).forEach(([name, url]) => {
    if (!url) {
      if (name === 'jupiter') {
        missingEnvVars.push('JUPITER_SWAP_API')
      } else {
        missingEnvVars.push(`QUIKNODE_${name.toUpperCase()}_RPC`)
      }
    }
  })

  if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:')
    missingEnvVars.forEach(envVar => {
      console.error(`   - ${envVar}`)
    })
    console.error('\nPlease set these in your .env.local file before running tests.')
    process.exit(1)
  }

  async function testSolanaEndpoint(url) {
    const start = Date.now()
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getHealth'
        })
      })
      
      const duration = Date.now() - start
      const data = await response.json()
      
      return {
        success: response.ok && data.result === 'ok',
        duration,
        data: data.result || data.error
      }
    } catch (error) {
      return {
        success: false,
        duration: Date.now() - start,
        error: error.message
      }
    }
  }

  async function testEVMEndpoint(url, chainName) {
    const start = Date.now()
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_blockNumber',
          params: []
        })
      })
      
      const duration = Date.now() - start
      const data = await response.json()
      
      const blockNumber = data.result ? parseInt(data.result, 16) : null
      
      return {
        success: response.ok && blockNumber > 0,
        duration,
        blockNumber,
        data: data.result || data.error
      }
    } catch (error) {
      return {
        success: false,
        duration: Date.now() - start,
        error: error.message
      }
    }
  }

  async function testJupiterEndpoint(url) {
    const start = Date.now()
    try {
      // Test with a small SOL to USDC quote
      const response = await fetch(`${url}/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1000000&slippageBps=50`)
      
      const duration = Date.now() - start
      const data = await response.json()
      
      return {
        success: response.ok && data.outAmount > 0,
        duration,
        outAmount: data.outAmount,
        error: data.error
      }
    } catch (error) {
      return {
        success: false,
        duration: Date.now() - start,
        error: error.message
      }
    }
  }

  async function runPerformanceTest() {
    console.log('🚀 QuickNode Endpoint Performance Test')
    console.log('=' * 50)
    
    // Test Solana endpoint
    console.log('\n🟣 Testing Solana Endpoint...')
    const solanaResult = await testSolanaEndpoint(endpoints.solana)
    console.log(`   Status: ${solanaResult.success ? '✅ Healthy' : '❌ Failed'}`)
    console.log(`   Response Time: ${solanaResult.duration}ms`)
    if (solanaResult.error) {
      console.log(`   Error: ${solanaResult.error}`)
    }
    
    // Test Polygon endpoint
    console.log('\n🟢 Testing Polygon Endpoint...')
    const polygonResult = await testEVMEndpoint(endpoints.polygon, 'Polygon')
    console.log(`   Status: ${polygonResult.success ? '✅ Connected' : '❌ Failed'}`)
    console.log(`   Response Time: ${polygonResult.duration}ms`)
    if (polygonResult.blockNumber) {
      console.log(`   Latest Block: ${polygonResult.blockNumber.toLocaleString()}`)
    }
    if (polygonResult.error) {
      console.log(`   Error: ${polygonResult.error}`)
    }
    
    // Test BSC endpoint
    console.log('\n🟡 Testing BSC Endpoint...')
    const bscResult = await testEVMEndpoint(endpoints.bsc, 'BSC')
    console.log(`   Status: ${bscResult.success ? '✅ Connected' : '❌ Failed'}`)
    console.log(`   Response Time: ${bscResult.duration}ms`)
    if (bscResult.blockNumber) {
      console.log(`   Latest Block: ${bscResult.blockNumber.toLocaleString()}`)
    }
    if (bscResult.error) {
      console.log(`   Error: ${bscResult.error}`)
    }
    
    // Test Jupiter endpoint
    console.log('\n🔄 Testing Jupiter Swap API...')
    const jupiterResult = await testJupiterEndpoint(endpoints.jupiter)
    console.log(`   Status: ${jupiterResult.success ? '✅ Working' : '❌ Failed'}`)
    console.log(`   Response Time: ${jupiterResult.duration}ms`)
    if (jupiterResult.outAmount) {
      console.log(`   Sample Quote: 1 SOL = ${(jupiterResult.outAmount / 1000000).toFixed(2)} USDC`)
    }
    if (jupiterResult.error) {
      console.log(`   Error: ${jupiterResult.error}`)
    }
    
    // Summary
    console.log('\n📊 Summary:')
    const totalTests = 4
    const passedTests = [solanaResult, polygonResult, bscResult, jupiterResult].filter(r => r.success).length
    const avgResponseTime = [solanaResult, polygonResult, bscResult, jupiterResult].reduce((sum, r) => sum + r.duration, 0) / totalTests
    
    console.log(`   Tests Passed: ${passedTests}/${totalTests}`)
    console.log(`   Average Response Time: ${avgResponseTime.toFixed(0)}ms`)
    
    if (passedTests === totalTests) {
      console.log('   🎉 All endpoints are working perfectly!')
    } else {
      console.log('   ⚠️  Some endpoints need attention')
    }
    
    return passedTests === totalTests
  }

  // Run the test
  if (require.main === module) {
    runPerformanceTest().then(success => {
      process.exit(success ? 0 : 1)
    }).catch(error => {
      console.error('Test failed:', error)
      process.exit(1)
    })
  }

  module.exports = { runPerformanceTest }
}

// Call the function to execute the test
testEndpoints()