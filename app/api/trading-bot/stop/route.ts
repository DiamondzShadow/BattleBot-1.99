import { type NextRequest, NextResponse } from "next/server"
import { getTradingBotService } from "@/lib/trading-bot-service"

export async function POST(request: NextRequest) {
  try {
    const tradingBotService = getTradingBotService()
    tradingBotService.stop()

    return NextResponse.json({
      success: true,
      message: "Trading bot stopped",
      status: tradingBotService.getStatus(),
    })
  } catch (error) {
    console.error("Error stopping trading bot:", error)
    return NextResponse.json({ error: "Failed to stop trading bot" }, { status: 500 })
  }
}
