import { NextResponse } from "next/server"
import { getWalletService } from "@/lib/wallet-service"

export async function GET() {
  try {
    const walletService = getWalletService()
    
    // Get wallet status for all chains
    const walletStatus = walletService.getWalletStatus()
    
    // Get all wallet addresses
    const addresses = walletService.getAllWalletAddresses()
    
    // Count available wallets
    const availableWallets = Object.values(walletStatus).filter(status => status.available).length
    const totalChains = Object.keys(walletStatus).length
    
    return NextResponse.json({
      success: true,
      summary: {
        availableWallets,
        totalChains,
        allWalletsConfigured: availableWallets === totalChains
      },
      walletStatus,
      addresses,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error getting wallet status:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get wallet status",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}