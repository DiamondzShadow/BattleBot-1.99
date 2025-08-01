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

  // Check configured endpoints
  const configuredEndpoints = {}
  const skippedEndpoints = []
  
  Object.entries(endpoints).forEach(([name, url]) => {
    if (url && !url.includes('YOUR_KEY_HERE')) {
      configuredEndpoints[name] = url
    } else {
      skippedEndpoints.push(name)
    }
  })

  if (skippedEndpoints.length > 0) {
    console.log('ℹ️  Skipping unconfigured endpoints:')
    skippedEndpoints.forEach(name => {
      const envVar = name === 'jupiter' ? 'JUPITER_SWAP_API' : `QUIKNODE_${name.toUpperCase()}_RPC`
      console.log(`   - ${name} (${envVar} not configured)`)
    })
    console.log('')
  }

  if (Object.keys(configuredEndpoints).length === 0) {
    console.error('❌ No endpoints are configured. Please set at least one endpoint in your .env.local file.')
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
    console.log('='.repeat(50))
    
    const results = []
    
    // Define test configurations for each endpoint
    const testDefinitions = [
      {
        name: 'solana',
        logName: 'Solana Endpoint',
        icon: '🟣',
        testFn: testSolanaEndpoint,
        url: configuredEndpoints.solana,
        formatResult: (r) => `Status: ${r.success ? '✅ Healthy' : '❌ Failed'}`,
        formatExtra: (r) => null
      },
      {
        name: 'polygon',
        logName: 'Polygon Endpoint', 
        icon: '🟢',
        testFn: (url) => testEVMEndpoint(url, 'Polygon'),
        url: configuredEndpoints.polygon,
        formatResult: (r) => `Status: ${r.success ? '✅ Connected' : '❌ Failed'}`,
        formatExtra: (r) => r.blockNumber ? `   Latest Block: ${r.blockNumber.toLocaleString()}` : null
      },
      {
        name: 'bsc',
        logName: 'BSC Endpoint',
        icon: '🟡', 
        testFn: (url) => testEVMEndpoint(url, 'BSC'),
        url: configuredEndpoints.bsc,
        formatResult: (r) => `Status: ${r.success ? '✅ Connected' : '❌ Failed'}`,
        formatExtra: (r) => r.blockNumber ? `   Latest Block: ${r.blockNumber.toLocaleString()}` : null
      },
      {
        name: 'jupiter',
        logName: 'Jupiter Swap API',
        icon: '🔄',
        testFn: testJupiterEndpoint,
        url: configuredEndpoints.jupiter,
        formatResult: (r) => `Status: ${r.success ? '✅ Working' : '❌ Failed'}`,
        formatExtra: (r) => r.outAmount ? `   Sample Quote: 1 SOL = ${(r.outAmount / 1000000).toFixed(2)} USDC` : null
      }
    ]

    // Execute tests for each configured endpoint
    for (const testDef of testDefinitions) {
      if (testDef.url) {
        console.log(`\n${testDef.icon} Testing ${testDef.logName}...`)
        const result = await testDef.testFn(testDef.url)
        console.log(`   ${testDef.formatResult(result)}`)
        console.log(`   Response Time: ${result.duration}ms`)
        
        const extra = testDef.formatExtra(result)
        if (extra) {
          console.log(extra)
        }
        
        if (result.error) {
          console.log(`   Error: ${result.error}`)
        }
        
        results.push(result)
      }
    }
    
    // Summary
    console.log('\n📊 Summary:')
    const totalTests = results.length
    const passedTests = results.filter(r => r.success).length
    const avgResponseTime = totalTests > 0 ? results.reduce((sum, r) => sum + r.duration, 0) / totalTests : 0
    
    console.log(`   Tests Passed: ${passedTests}/${totalTests}`)
    console.log(`   Average Response Time: ${totalTests > 0 ? avgResponseTime.toFixed(0) : 0}ms`)
    
    if (passedTests === totalTests && totalTests > 0) {
      console.log('   🎉 All configured endpoints are working perfectly!')
    } else if (totalTests === 0) {
      console.log('   ⚠️  No endpoints are configured for testing')
    } else {
      console.log('   ⚠️  Some endpoints need attention')
    }
    
    return passedTests === totalTests && totalTests > 0
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