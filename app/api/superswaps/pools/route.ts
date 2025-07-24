import { type NextRequest, NextResponse } from "next/server"
import { getSuperSwapsService, DEX_PROTOCOLS, OPTIMISM_TOKENS } from "@/lib/superswaps-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const target = searchParams.get('target')
    const symbol = searchParams.get('symbol')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = (searchParams.get('sort') as "liquidity" | "volume" | "fees" | "apr") || "liquidity"

    const superSwaps = getSuperSwapsService()

    if (action === 'detailed') {
      // Get detailed pool information
      const pools = await superSwaps.getDetailedPools(target, symbol, limit, sortBy)

      return NextResponse.json({
        success: true,
        pools,
        count: pools.length,
        filters: {
          target,
          symbol,
          limit,
          sortBy
        },
        source: "quicknode-superswaps"
      })
    } else if (action === 'analytics') {
      // Get pool analytics
      const poolAddress = searchParams.get('address')
      const timeframe = (searchParams.get('timeframe') as "24h" | "7d" | "30d") || "24h"

      if (!poolAddress) {
        return NextResponse.json(
          { success: false, error: "Pool address is required for analytics" },
          { status: 400 }
        )
      }

      const analytics = await superSwaps.getPoolAnalytics(poolAddress, timeframe)

      if (!analytics) {
        return NextResponse.json(
          { success: false, error: "Pool analytics not available" },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        poolAddress,
        timeframe,
        analytics,
        source: "quicknode-superswaps"
      })
    } else if (action === 'overview') {
      // Get DEX market overview
      const overview = await superSwaps.getDEXMarketOverview()

      return NextResponse.json({
        success: true,
        overview,
        source: "quicknode-superswaps"
      })
    } else {
      return NextResponse.json({
        success: true,
        message: "QuickNode SuperSwaps Service - Liquidity Pool Analysis",
        features: [
          "Detailed pool information across DEXs",
          "Real-time liquidity analysis",
          "Multi-DEX comparison",
          "Arbitrage opportunity detection",
          "Optimal swap routing",
          "Pool performance analytics"
        ],
        endpoints: {
          "GET /?action=detailed": "Get detailed pool information",
          "GET /?action=analytics&address={pool}": "Get pool analytics",
          "GET /?action=overview": "Get DEX market overview",
          "POST /": "Analyze multi-DEX liquidity"
        },
        supportedDEXs: Object.values(DEX_PROTOCOLS),
        commonTokens: OPTIMISM_TOKENS,
        sortOptions: ["liquidity", "volume", "fees", "apr"],
        timeframes: ["24h", "7d", "30d"]
      })
    }
  } catch (error) {
    console.error("Error with SuperSwaps Pools API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process pools request",
        message: error.message
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, tokenAddress, symbol, tokens, minProfit, maxGas } = await request.json()

    const superSwaps = getSuperSwapsService()

    if (action === 'analyze') {
      // Analyze multi-DEX liquidity for a token
      if (!tokenAddress) {
        return NextResponse.json(
          { success: false, error: "Token address is required for analysis" },
          { status: 400 }
        )
      }

      const analysis = await superSwaps.analyzeMultiDEXLiquidity(tokenAddress, symbol)

      if (!analysis) {
        return NextResponse.json(
          { success: false, error: "Multi-DEX analysis not available" },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        tokenAddress,
        symbol,
        analysis,
        source: "quicknode-superswaps"
      })
    } else if (action === 'arbitrage') {
      // Find arbitrage opportunities
      if (!tokens || !Array.isArray(tokens)) {
        return NextResponse.json(
          { success: false, error: "Tokens array is required for arbitrage scan" },
          { status: 400 }
        )
      }

      const opportunities = await superSwaps.findArbitrageOpportunities(
        tokens,
        minProfit || 0.01,
        maxGas || 0.01
      )

      return NextResponse.json({
        success: true,
        opportunities,
        count: opportunities.length,
        criteria: {
          minProfit: minProfit || 0.01,
          maxGas: maxGas || 0.01
        },
        source: "quicknode-superswaps"
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid action. Use: analyze, arbitrage",
          examples: {
            "Multi-DEX Analysis": {
              action: "analyze",
              tokenAddress: OPTIMISM_TOKENS.VELO,
              symbol: "VELO"
            },
            "Arbitrage Scan": {
              action: "arbitrage",
              tokens: [OPTIMISM_TOKENS.VELO, OPTIMISM_TOKENS.OP],
              minProfit: 0.01,
              maxGas: 0.01
            }
          }
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error with SuperSwaps Pools API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process pools request",
        message: error.message
      },
      { status: 500 }
    )
  }
}