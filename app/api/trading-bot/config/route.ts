import { type NextRequest, NextResponse } from "next/server"
import { getTradingBotService } from "@/lib/trading-bot-service"

export async function GET(request: NextRequest) {
  try {
    const tradingBotService = getTradingBotService()
    const config = tradingBotService.getConfig()

    return NextResponse.json(config)
  } catch (error) {
    console.error("Error getting trading bot config:", error)
    return NextResponse.json({ error: "Failed to get trading bot config" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const tradingBotService = getTradingBotService()
    const config = await request.json()
    tradingBotService.updateConfig(config)

    return NextResponse.json({
      success: true,
      message: "Trading bot configuration updated",
      config: tradingBotService.getConfig(),
    })
  } catch (error) {
    console.error("Error updating trading bot config:", error)
    return NextResponse.json({ error: "Failed to update trading bot config" }, { status: 500 })
  }
}
