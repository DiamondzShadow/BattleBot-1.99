import { NextResponse } from "next/server"
import { getWalletService } from "@/lib/wallet-service"

export async function GET() {
  try {
    const walletService = getWalletService()
    
    // Get all wallet addresses first
    const addresses = walletService.getAllWalletAddresses()
    
    // Get balances for all chains
    const balances: Record<string, any> = {}
    
    for (const chain of Object.keys(addresses)) {
      try {
        const balance = await walletService.getWalletBalance(chain)
        balances[chain] = {
          address: addresses[chain],
          balance: balance || "0",
          available: balance !== null,
          symbol: chain === 'solana' ? 'SOL' : 'ETH'
        }
      } catch (error) {
        balances[chain] = {
          address: addresses[chain],
          balance: "0",
          available: false,
          error: error.message,
          symbol: chain === 'solana' ? 'SOL' : 'ETH'
        }
      }
    }
    
    // Calculate total value (simplified - in production you'd use real USD prices)
    let totalBalanceUSD = 0
    for (const [chain, data] of Object.entries(balances)) {
      if (data.available && data.balance) {
        // Mock USD conversion (replace with real price API)
        const mockPrice = chain === 'solana' ? 100 : 2000 // SOL ~$100, ETH ~$2000
        totalBalanceUSD += parseFloat(data.balance) * mockPrice
      }
    }
    
    return NextResponse.json({
      success: true,
      totalBalanceUSD: totalBalanceUSD.toFixed(2),
      balances,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error getting wallet balances:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get wallet balances",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}