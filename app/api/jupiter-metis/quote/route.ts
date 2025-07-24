import { type NextRequest, NextResponse } from "next/server"
import { getJupiterMetisService, COMMON_TOKENS } from "@/lib/jupiter-metis-service"

export async function POST(request: NextRequest) {
  try {
    const { inputToken, outputToken, amount, analyze = false } = await request.json()

    const jupiterMetis = getJupiterMetisService()

    // Get input and output mint addresses
    const inputMint = COMMON_TOKENS[inputToken as keyof typeof COMMON_TOKENS] || inputToken
    const outputMint = COMMON_TOKENS[outputToken as keyof typeof COMMON_TOKENS] || outputToken

    if (analyze) {
      // Perform comprehensive analysis
      const analysis = await jupiterMetis.analyzeTokenProfitability(inputMint, amount)
      
      return NextResponse.json({
        success: true,
        analysis,
        inputToken,
        outputToken,
        amount,
        source: "jupiter-metis"
      })
    } else {
      // Get simple quote
      const quote = await jupiterMetis.getQuote(inputMint, outputMint, amount)
      
      return NextResponse.json({
        success: true,
        quote: {
          inputMint: quote.inputMint,
          outputMint: quote.outputMint,
          inAmount: quote.inAmount,
          outAmount: quote.outAmount,
          priceImpactPct: quote.priceImpactPct,
          routePlan: quote.routePlan.map(route => ({
            ammKey: route.swapInfo.ammKey,
            label: route.swapInfo.label,
            percent: route.percent
          }))
        },
        price: parseFloat(quote.outAmount) / parseFloat(quote.inAmount),
        priceImpact: parseFloat(quote.priceImpactPct),
        source: "jupiter-metis"
      })
    }
  } catch (error) {
    console.error("Error with Jupiter Metis API:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to get Jupiter Metis quote",
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

    const jupiterMetis = getJupiterMetisService()

    if (action === 'tokens') {
      // Get supported tokens
      const tokens = await jupiterMetis.getSupportedTokens()
      
      return NextResponse.json({
        success: true,
        tokens: tokens.slice(0, 50), // Limit to first 50 for demo
        count: tokens.length,
        commonTokens: COMMON_TOKENS
      })
    } else if (action === 'price') {
      // Get price for SOL/USDC
      const price = await jupiterMetis.getPrice(COMMON_TOKENS.SOL, COMMON_TOKENS.USDC)
      
      return NextResponse.json({
        success: true,
        pair: "SOL/USDC",
        price: price.price,
        priceImpact: price.priceImpact,
        route: price.route
      })
    } else {
      return NextResponse.json({
        success: true,
        message: "Jupiter Metis API is working",
        endpoints: {
          "POST /": "Get quote or analysis",
          "GET /?action=tokens": "Get supported tokens",
          "GET /?action=price": "Get SOL/USDC price"
        },
        commonTokens: COMMON_TOKENS
      })
    }
  } catch (error) {
    console.error("Error with Jupiter Metis API:", error)
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