import { type NextRequest, NextResponse } from "next/server"
import { getTradingBotService } from "@/lib/trading-bot-service"

export async function GET(request: NextRequest) {
  try {
    const tradingBotService = getTradingBotService()
    const activeTrades = tradingBotService.getActiveTrades()
    const tradeHistory = tradingBotService.getTradeHistory()

    return NextResponse.json({
      trades: activeTrades,
      history: tradeHistory,
    })
  } catch (error) {
    console.error("Error getting trading bot trades:", error)
    return NextResponse.json({ error: "Failed to get trading bot trades" }, { status: 500 })
  }
}
