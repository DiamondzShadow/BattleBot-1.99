import { type NextRequest, NextResponse } from "next/server"
import { getProductionTradingBotService } from "@/lib/production-trading-bot"

export async function POST(request: NextRequest) {
  try {
    const tradingBotService = getProductionTradingBotService()
    tradingBotService.stop()

    return NextResponse.json({
      success: true,
      message: "Production trading bot stopped",
      status: tradingBotService.getStatus(),
    })
  } catch (error) {
    console.error("Error stopping production trading bot:", error)
    return NextResponse.json({ error: "Failed to stop production trading bot" }, { status: 500 })
  }
}
