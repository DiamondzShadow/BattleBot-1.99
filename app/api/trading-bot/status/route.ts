import { type NextRequest, NextResponse } from "next/server"
import { getTradingBotService } from "@/lib/trading-bot-service"

export async function GET(request: NextRequest) {
  try {
    const tradingBotService = getTradingBotService()
    const status = tradingBotService.getStatus()
    const config = tradingBotService.getConfig()
    const stats = tradingBotService.getTradingStats()

    return NextResponse.json({
      status,
      config,
      stats,
    })
  } catch (error) {
    console.error("Error getting trading bot status:", error)
    return NextResponse.json({ error: "Failed to get trading bot status" }, { status: 500 })
  }
}
