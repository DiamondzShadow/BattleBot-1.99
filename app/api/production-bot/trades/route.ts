import { type NextRequest, NextResponse } from "next/server"
import { getProductionTradingBotService } from "@/lib/production-trading-bot"

export async function GET(request: NextRequest) {
  try {
    const tradingBotService = getProductionTradingBotService()
    const activeTrades = tradingBotService.getActiveTrades()
    const tradeHistory = tradingBotService.getTradeHistory()

    return NextResponse.json({
      success: true,
      activeTrades,
      tradeHistory,
    })
  } catch (error) {
    console.error("Error getting production trading bot trades:", error)
    return NextResponse.json({ error: "Failed to get production trading bot trades" }, { status: 500 })
  }
}
