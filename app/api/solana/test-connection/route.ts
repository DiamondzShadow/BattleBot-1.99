import { NextResponse } from "next/server"
import { getSolanaService } from "@/lib/solana-service"

export async function GET() {
  try {
    const solanaService = getSolanaService()
    const activeRpcUrl = solanaService.getActiveRpcUrl()

    // Get the connection
    const connection = solanaService.getConnection()

    // Test the connection by getting the latest block height
    const blockHeight = await connection.getBlockHeight()

    // Get the latest blockhash
    const { blockhash } = await connection.getRecentBlockhash()

    return NextResponse.json({
      success: true,
      activeRpcUrl: activeRpcUrl.replace(/\/[^/]*$/, "/..."), // Hide API key
      blockHeight,
      blockhash,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error testing Solana connection:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
