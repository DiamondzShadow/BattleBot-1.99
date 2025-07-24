import { type NextRequest, NextResponse } from "next/server"
import { getProductionTradingBotService } from "@/lib/production-trading-bot"

export async function POST(request: NextRequest) {
  try {
    const tradingBotService = getProductionTradingBotService()
    tradingBotService.start()

    return NextResponse.json({
      success: true,
      message: "Production trading bot started",
      status: tradingBotService.getStatus(),
    })
  } catch (error) {
    console.error("Error starting production trading bot:", error)
    return NextResponse.json({ error: "Failed to start production trading bot" }, { status: 500 })
  }
}
