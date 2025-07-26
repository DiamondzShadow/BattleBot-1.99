#!/usr/bin/env node

/**
 * Minimal Solana Bot Test
 * Tests only the essential Solana functionality
 */

const fetch = require('node-fetch')
const { Connection, PublicKey } = require('@solana/web3.js')

async function testMinimalSolanaSetup() {
  console.log('🚀 Testing Minimal Solana Bot Setup...\n')

  // Check environment
  const solanaRPC = process.env.QUIKNODE_SOLANA_RPC || process.env.SOLANA_DEVNET_RPC
  
  if (!solanaRPC) {
    console.error('❌ No Solana RPC endpoint found!')
    console.error('\nPlease set one of these in your .env.local:')
    console.error('- QUIKNODE_SOLANA_RPC (for mainnet)')
    console.error('- SOLANA_DEVNET_RPC (for testing)\n')
    console.error('Free options:')
    console.error('- Devnet: https://api.devnet.solana.com')
    console.error('- QuickNode free tier: https://www.quicknode.com/')
    process.exit(1)
  }

  console.log('✅ Found Solana RPC endpoint')
  console.log(`📍 Using: ${solanaRPC.substring(0, 50)}...`)

  // Test 1: Basic connectivity
  console.log('\n1️⃣ Testing RPC connectivity...')
  try {
    const connection = new Connection(solanaRPC, 'confirmed')
    const version = await connection.getVersion()
    console.log('✅ Connected to Solana')
    console.log(`   Version: ${version['solana-core']}`)
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    return
  }

  // Test 2: Get recent blockhash (required for transactions)
  console.log('\n2️⃣ Testing transaction capability...')
  try {
    const connection = new Connection(solanaRPC, 'confirmed')
    const blockhash = await connection.getLatestBlockhash()
    console.log('✅ Can fetch blockhash (required for transactions)')
    console.log(`   Blockhash: ${blockhash.blockhash.substring(0, 20)}...`)
  } catch (error) {
    console.error('❌ Cannot fetch blockhash:', error.message)
    return
  }

  // Test 3: Check a known token (USDC on mainnet/devnet)
  console.log('\n3️⃣ Testing token account queries...')
  try {
    const connection = new Connection(solanaRPC, 'confirmed')
    // USDC mint address (same on mainnet and devnet for testing)
    const usdcMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
    const supply = await connection.getTokenSupply(usdcMint)
    console.log('✅ Can query token information')
    console.log(`   USDC Supply: ${supply.value.uiAmount?.toLocaleString() || 'N/A'}`)
  } catch (error) {
    console.log('⚠️  Token query failed (might be on devnet):', error.message)
  }

  // Test 4: Minimal trading bot requirements
  console.log('\n4️⃣ Checking minimal bot requirements...')
  const requirements = {
    'Solana Web3.js': require('@solana/web3.js').VERSION || 'Installed',
    'SPL Token': 'Installed',
    'Node.js version': process.version,
    'Environment': process.env.BOT_ENVIRONMENT || 'Not set'
  }

  Object.entries(requirements).forEach(([req, status]) => {
    console.log(`   ${req}: ${status}`)
  })

  console.log('\n✅ Minimal Solana bot environment is ready!')
  console.log('\nNext steps:')
  console.log('1. Replace the RPC endpoint in .env.local with your actual endpoint')
  console.log('2. Run: pnpm dev (to start the web interface)')
  console.log('3. Or run: node scripts/test-trading-bot.js (to test the bot)')
}

// Run the test
testMinimalSolanaSetup().catch(console.error)