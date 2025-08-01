import { type NextRequest, NextResponse } from "next/server"
import { Connection } from "@solana/web3.js"

const SOLANA_RPC_URL = process.env.QUIKNODE_SOLANA_RPC || "https://api.mainnet-beta.solana.com"

export async function GET(request: NextRequest) {
  try {
    const connection = new Connection(SOLANA_RPC_URL)
    
    // Test the connection
    const [health, slot] = await Promise.allSettled([
      connection.getHealth(),
      connection.getSlot()
    ])
    
    return NextResponse.json({
      success: true,
      health: health.status === 'fulfilled' ? health.value : 'error',
      slot: slot.status === 'fulfilled' ? slot.value : null,
      rpcUrl: SOLANA_RPC_URL,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error checking Solana health:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to check Solana health",
        rpcUrl: SOLANA_RPC_URL 
      }, 
      { status: 500 }
    )
  }
}