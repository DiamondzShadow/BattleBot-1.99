import { type NextRequest, NextResponse } from "next/server"
import { getPumpFunService } from "@/lib/pump-fun-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const limit = parseInt(searchParams.get('limit') || '10')

    const pumpFunService = getPumpFunService()

    switch (action) {
      case 'trending':
        const sortBy = searchParams.get('sortBy') as "volume" | "marketCap" | "created" | "kingOfHill" || "volume"
        const trending = await pumpFunService.getTrendingTokens(limit, sortBy)
        
        return NextResponse.json({
          success: true,
          action: "trending",
          sortBy,
          count: trending.length,
          tokens: trending,
          summary: {
            totalVolume24h: trending.reduce((sum, token) => sum + token.price.volume24h, 0),
            averageMarketCap: trending.reduce((sum, token) => sum + token.metadata.marketCap, 0) / trending.length,
            kingOfHillCount: trending.filter(token => token.trading.kingOfHill).length
          }
        })

      case 'opportunities':
        const maxRisk = searchParams.get('maxRisk') as "medium" | "high" | "extreme" || "high"
        const minProfitability = parseInt(searchParams.get('minProfitability') || '60')
        
        const opportunities = await pumpFunService.findBestOpportunities(maxRisk, minProfitability)
        
        return NextResponse.json({
          success: true,
          action: "opportunities",
          filters: { maxRisk, minProfitability },
          count: opportunities.length,
          opportunities: opportunities.slice(0, limit),
          topPick: opportunities[0] || null
        })

      case 'graduation':
        const graduationCandidates = await pumpFunService.getGraduationCandidates()
        
        return NextResponse.json({
          success: true,
          action: "graduation",
          count: graduationCandidates.length,
          candidates: graduationCandidates.slice(0, limit),
          nearestGraduation: graduationCandidates[0] || null
        })

      case 'king-of-hill':
        const kingTokens = await pumpFunService.getKingOfHillTokens()
        
        return NextResponse.json({
          success: true,
          action: "king-of-hill",
          count: kingTokens.length,
          tokens: kingTokens,
          totalVolume: kingTokens.reduce((sum, token) => sum + token.price.volume24h, 0)
        })

      case 'recent':
        const hours = parseInt(searchParams.get('hours') || '24')
        const recentTokens = await pumpFunService.getRecentlyCreated(hours)
        
        return NextResponse.json({
          success: true,
          action: "recent",
          timeframe: `${hours} hours`,
          count: recentTokens.length,
          tokens: recentTokens.slice(0, limit),
          newestToken: recentTokens[0] || null
        })

      case 'streams':
        const streams = await pumpFunService.getLiveStreams(limit)
        
        return NextResponse.json({
          success: true,
          action: "streams",
          count: streams.length,
          streams,
          totalViewers: streams.reduce((sum, stream) => sum + stream.viewers, 0),
          liveCount: streams.filter(stream => stream.status === "live").length
        })

      default:
        return NextResponse.json({
          success: true,
          message: "QuickNode Pump.fun Service - Meme Coin Trading Opportunities",
          endpoints: {
            "GET /?action=trending": "Get trending tokens",
            "GET /?action=opportunities": "Find best trading opportunities", 
            "GET /?action=graduation": "Tokens nearing Raydium graduation",
            "GET /?action=king-of-hill": "King of the Hill tokens",
            "GET /?action=recent": "Recently created tokens",
            "GET /?action=streams": "Live streams"
          },
          parameters: {
            limit: "Number of results (default: 10)",
            sortBy: "volume | marketCap | created | kingOfHill",
            maxRisk: "medium | high | extreme",
            minProfitability: "Number 0-100 (default: 60)",
            hours: "Hours for recent tokens (default: 24)"
          },
          pumpFunStats: {
            totalSupply: 1000000000,
            graduationMarketCap: "$69,000",
            tradingFee: "1%",
            bondingCurveStages: ["Early (0-25%)", "Growth (25-50%)", "Mature (50-75%)", "Graduation (75-100%)"]
          }
        })
    }
  } catch (error) {
    console.error("Error with Pump.fun API:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch Pump.fun data",
        message: error.message 
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tokenMint, quoteParams } = await request.json()

    if (!tokenMint) {
      return NextResponse.json(
        { 
          success: false,
          error: "Token mint is required",
          example: {
            tokenMint: "DogePumpKing1234567890abcdef1234567890abcdef12345678",
            quoteParams: {
              inputMint: "So11111111111111111111111111111111111111112",
              amount: 1000000,
              slippageBps: 500
            }
          }
        }, 
        { status: 400 }
      )
    }

    const pumpFunService = getPumpFunService()

    if (quoteParams) {
      // Get quote for token swap
      const { inputMint, amount, slippageBps } = quoteParams
      const quote = await pumpFunService.getPumpFunQuote(
        inputMint,
        tokenMint,
        amount,
        slippageBps
      )

      return NextResponse.json({
        success: true,
        tokenMint,
        quote,
        analysis: quote ? {
          expectedOutput: parseInt(quote.outAmount),
          priceImpact: parseFloat(quote.priceImpactPct),
          feeAmount: parseInt(quote.routePlan[0]?.swapInfo.feeAmount || "0"),
          route: quote.routePlan[0]?.swapInfo.label || "Pump.fun Bonding Curve"
        } : null
      })
    } else {
      // Analyze token for trading opportunities
      const analysis = await pumpFunService.analyzeTrendingToken(tokenMint)
      
      return NextResponse.json({
        success: true,
        tokenMint,
        analysis,
        tradingSignal: analysis ? {
          action: analysis.recommendation,
          confidence: analysis.profitability,
          riskLevel: analysis.riskLevel,
          momentum: analysis.momentum,
          summary: analysis.reasons.join("; ")
        } : null
      })
    }
  } catch (error) {
    console.error("Error analyzing Pump.fun token:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to analyze token",
        message: error.message 
      }, 
      { status: 500 }
    )
  }
}