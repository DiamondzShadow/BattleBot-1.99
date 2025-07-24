import { NextResponse } from "next/server"
import { getProductionTradingBot } from "@/lib/production-trading-bot"

export async function GET() {
  try {
    const tradingBot = getProductionTradingBot()

    return NextResponse.json({
      success: true,
      config: tradingBot.getConfig(),
    })
  } catch (error) {
    console.error("Error getting production trading bot config:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get production trading bot config",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const tradingBot = getProductionTradingBot()
    const config = await request.json()

    tradingBot.updateConfig(config)

    return NextResponse.json({
      success: true,
      message: "Production trading bot config updated successfully",
      config: tradingBot.getConfig(),
    })
  } catch (error) {
    console.error("Error updating production trading bot config:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update production trading bot config",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
