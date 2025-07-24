import { type NextRequest, NextResponse } from "next/server"
import { getTradingBotService } from "@/lib/trading-bot-service"

export async function POST(request: NextRequest) {
  try {
    const tradingBotService = getTradingBotService()
    tradingBotService.start()

    return NextResponse.json({
      success: true,
      message: "Trading bot started",
      status: tradingBotService.getStatus(),
    })
  } catch (error) {
    console.error("Error starting trading bot:", error)
    return NextResponse.json({ error: "Failed to start trading bot" }, { status: 500 })
  }
}
