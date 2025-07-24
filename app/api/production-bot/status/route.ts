import { type NextRequest, NextResponse } from "next/server"
import { getProductionTradingBotService } from "@/lib/production-trading-bot"

export async function GET(request: NextRequest) {
  try {
    const tradingBotService = getProductionTradingBotService()
    const status = tradingBotService.getStatus()
    const stats = tradingBotService.getTradingStats()

    return NextResponse.json({
      success: true,
      status,
      stats,
    })
  } catch (error) {
    console.error("Error getting production trading bot status:", error)
    return NextResponse.json({ error: "Failed to get production trading bot status" }, { status: 500 })
  }
}
