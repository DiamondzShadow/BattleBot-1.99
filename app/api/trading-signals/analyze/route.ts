import { type NextRequest, NextResponse } from "next/server"
import { getTradingSignalsService } from "@/lib/trading-signals-service"

export async function POST(request: NextRequest) {
  try {
    const { tokenId, action = "signals", options = {} } = await request.json()

    if (!tokenId) {
      return NextResponse.json(
        {
          success: false,
          error: "Token ID is required",
          example: {
            tokenId: 35987,
            action: "signals" | "analysis" | "recommendations",
            options: { limit: 50, page: 1 }
          }
        },
        { status: 400 }
      )
    }

    const tradingSignals = getTradingSignalsService()

    if (action === "signals") {
      // Get trading signals for the token
      const signals = await tradingSignals.getTradingSignals(
        tokenId,
        options.limit || 50,
        options.page || 1
      )

      return NextResponse.json({
        success: true,
        tokenId,
        signals,
        count: signals.length,
        source: "quicknode-trading-signals"
      })
    } else if (action === "analysis") {
      // Get comprehensive token analysis
      const analysis = await tradingSignals.getTokenAnalysis(tokenId)

      if (!analysis) {
        return NextResponse.json(
          { success: false, error: "Token analysis not available" },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        tokenId,
        analysis,
        source: "quicknode-trading-signals"
      })
    } else if (action === "moonshots") {
      // Find moonshot opportunities
      const moonshots = await tradingSignals.findMoonshotOpportunities(
        options.minScore || 70,
        options.maxRisk || "MEDIUM"
      )

      return NextResponse.json({
        success: true,
        moonshots,
        count: moonshots.length,
        criteria: {
          minScore: options.minScore || 70,
          maxRisk: options.maxRisk || "MEDIUM"
        },
        source: "quicknode-trading-signals"
      })
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use: signals, analysis, or moonshots" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error with Trading Signals API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process trading signals request",
        message: error.message
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const severity = searchParams.get('severity') || "ALL"

    const tradingSignals = getTradingSignalsService()

    if (action === 'alerts') {
      // Get market alerts
      const alerts = await tradingSignals.getMarketAlerts(severity)

      return NextResponse.json({
        success: true,
        alerts,
        count: alerts.length,
        severity,
        source: "quicknode-trading-signals"
      })
    } else if (action === 'recommendations') {
      // Get trading recommendations for popular symbols
      const symbols = ['BTC', 'ETH', 'SOL', 'OP', 'ARB']
      const timeframe = (searchParams.get('timeframe') as "SHORT" | "MEDIUM" | "LONG") || "MEDIUM"
      
      const recommendations = await tradingSignals.getTradingRecommendations(symbols, timeframe)

      return NextResponse.json({
        success: true,
        recommendations,
        timeframe,
        symbols,
        source: "quicknode-trading-signals"
      })
    } else if (action === 'portfolio') {
      // Demo portfolio analysis
      const tokenIds = [35987, 1, 1027, 7083, 11841] // Sample token IDs
      const portfolio = await tradingSignals.getPortfolioSignals(tokenIds)

      return NextResponse.json({
        success: true,
        portfolio,
        tokenIds,
        source: "quicknode-trading-signals"
      })
    } else {
      return NextResponse.json({
        success: true,
        message: "QuickNode Trading Signals Service (Powered by TokenMetrics)",
        features: [
          "AI-powered trading signals",
          "Comprehensive token analysis",
          "Market alerts and notifications",
          "Portfolio-wide signal analysis",
          "Moonshot opportunity detection",
          "Real-time trading recommendations"
        ],
        endpoints: {
          "POST /": "Analyze tokens with AI signals",
          "GET /?action=alerts": "Get market alerts",
          "GET /?action=recommendations": "Get trading recommendations",
          "GET /?action=portfolio": "Get portfolio signals demo"
        },
        usage: {
          "Token Analysis": {
            method: "POST",
            body: {
              tokenId: 35987,
              action: "analysis"
            }
          },
          "Trading Signals": {
            method: "POST",
            body: {
              tokenId: 35987,
              action: "signals",
              options: { limit: 50, page: 1 }
            }
          },
          "Moonshot Detection": {
            method: "POST",
            body: {
              tokenId: 35987,
              action: "moonshots",
              options: { minScore: 70, maxRisk: "MEDIUM" }
            }
          }
        },
        signalTypes: ["STRONG_BUY", "BUY", "HOLD", "SELL", "STRONG_SELL"],
        riskLevels: ["LOW", "MEDIUM", "HIGH", "EXTREME"],
        timeframes: ["SHORT", "MEDIUM", "LONG"]
      })
    }
  } catch (error) {
    console.error("Error with Trading Signals API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process request",
        message: error.message
      },
      { status: 500 }
    )
  }
}