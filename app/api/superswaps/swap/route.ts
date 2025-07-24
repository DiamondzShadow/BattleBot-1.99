import { type NextRequest, NextResponse } from "next/server"
import { getSuperSwapsService, OPTIMISM_TOKENS } from "@/lib/superswaps-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenIn = searchParams.get('tokenIn')
    const tokenOut = searchParams.get('tokenOut')
    const amountIn = searchParams.get('amountIn')
    const slippage = parseFloat(searchParams.get('slippage') || '0.5')
    const dexs = searchParams.get('dexs')?.split(',')

    if (!tokenIn || !tokenOut || !amountIn) {
      return NextResponse.json(
        { 
          success: false, 
          error: "tokenIn, tokenOut, and amountIn are required",
          example: {
            tokenIn: OPTIMISM_TOKENS.USDC,
            tokenOut: OPTIMISM_TOKENS.VELO,
            amountIn: "1000000", // 1 USDC (6 decimals)
            slippage: 0.5,
            dexs: "uniswap,velodrome" // optional
          }
        },
        { status: 400 }
      )
    }

    const superSwaps = getSuperSwapsService()

    // Get the best swap quote across all DEXs
    const quote = await superSwaps.getBestSwapRoute(
      tokenIn,
      tokenOut,
      amountIn,
      slippage,
      dexs
    )

    if (!quote) {
      return NextResponse.json(
        { success: false, error: "No swap route found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      quote,
      request: {
        tokenIn,
        tokenOut,
        amountIn,
        slippage,
        includedDEXs: dexs
      },
      source: "quicknode-superswaps"
    })
  } catch (error) {
    console.error("Error with SuperSwaps quote API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get swap quote",
        message: error.message
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      action,
      tokenIn, 
      tokenOut, 
      amountIn, 
      slippage = 0.5,
      userAddress,
      simulate = true
    } = await request.json()

    if (action === 'execute') {
      // Execute optimal swap
      if (!tokenIn || !tokenOut || !amountIn || !userAddress) {
        return NextResponse.json(
          { 
            success: false, 
            error: "tokenIn, tokenOut, amountIn, and userAddress are required for swap execution",
            example: {
              action: "execute",
              tokenIn: OPTIMISM_TOKENS.USDC,
              tokenOut: OPTIMISM_TOKENS.VELO,
              amountIn: "1000000",
              slippage: 0.5,
              userAddress: "0x742d35Cc6527C5e66d58b6E4d1D3b0F6F0c38E0A"
            }
          },
          { status: 400 }
        )
      }

      const superSwaps = getSuperSwapsService()

      if (simulate) {
        // Simulate the swap (default behavior)
        const quote = await superSwaps.getBestSwapRoute(tokenIn, tokenOut, amountIn, slippage)
        
        if (!quote) {
          return NextResponse.json(
            { success: false, error: "No optimal route found for simulation" },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          simulation: {
            wouldExecute: true,
            route: quote.bestRoute,
            expectedOutput: quote.amountOut,
            savings: quote.savings,
            gasEstimate: quote.bestRoute.gas.total,
            successProbability: quote.execution.successProbability
          },
          message: "Swap simulation successful. Set simulate: false to execute.",
          source: "quicknode-superswaps"
        })
      } else {
        // Actually execute the swap
        const result = await superSwaps.executeOptimalSwap(
          tokenIn,
          tokenOut,
          amountIn,
          slippage,
          userAddress
        )

        return NextResponse.json({
          success: result.success,
          execution: result,
          source: "quicknode-superswaps"
        })
      }
    } else if (action === 'compare') {
      // Compare routes across different DEXs
      if (!tokenIn || !tokenOut || !amountIn) {
        return NextResponse.json(
          { success: false, error: "tokenIn, tokenOut, and amountIn are required for route comparison" },
          { status: 400 }
        )
      }

      const superSwaps = getSuperSwapsService()
      
      // Get quotes from multiple DEXs for comparison
      const allQuote = await superSwaps.getBestSwapRoute(tokenIn, tokenOut, amountIn, slippage)
      
      if (!allQuote) {
        return NextResponse.json(
          { success: false, error: "No routes found for comparison" },
          { status: 404 }
        )
      }

      // Create comparison data
      const comparison = {
        bestRoute: allQuote.bestRoute,
        allRoutes: allQuote.routes,
        savings: allQuote.savings,
        analysis: {
          totalRoutes: allQuote.routes.length,
          bestProtocol: allQuote.bestRoute.protocol,
          worstProtocol: allQuote.routes.reduce((worst, route) => 
            parseFloat(route.amountOut) < parseFloat(worst.amountOut) ? route : worst
          ).protocol,
          avgPriceImpact: allQuote.routes.reduce((sum, route) => sum + route.priceImpact, 0) / allQuote.routes.length,
          avgGasCost: allQuote.routes.reduce((sum, route) => sum + parseFloat(route.gas.total), 0) / allQuote.routes.length
        }
      }

      return NextResponse.json({
        success: true,
        comparison,
        request: { tokenIn, tokenOut, amountIn, slippage },
        source: "quicknode-superswaps"
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid action. Use: execute, compare",
          actions: {
            execute: "Execute optimal swap (with simulation option)",
            compare: "Compare routes across different DEXs"
          },
          examples: {
            "Execute Swap": {
              action: "execute",
              tokenIn: OPTIMISM_TOKENS.USDC,
              tokenOut: OPTIMISM_TOKENS.VELO,
              amountIn: "1000000",
              slippage: 0.5,
              userAddress: "0x742d35Cc6527C5e66d58b6E4d1D3b0F6F0c38E0A",
              simulate: true
            },
            "Compare Routes": {
              action: "compare",
              tokenIn: OPTIMISM_TOKENS.USDC,
              tokenOut: OPTIMISM_TOKENS.VELO,
              amountIn: "1000000",
              slippage: 0.5
            }
          }
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error with SuperSwaps execution API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process swap request",
        message: error.message
      },
      { status: 500 }
    )
  }
}