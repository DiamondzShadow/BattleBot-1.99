import { type NextRequest, NextResponse } from "next/server"

const JUPITER_API_URL = process.env.JUPITER_SWAP_API || "https://quote-api.jup.ag/v6"

export async function POST(request: NextRequest) {
  try {
    const { fromToken, toToken, amount } = await request.json()

    // Try to get real quote from Jupiter API via QuickNode
    try {
      const jupiterResponse = await fetch(
        `${JUPITER_API_URL}/quote?inputMint=${fromToken}&outputMint=${toToken}&amount=${amount}&slippageBps=50`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      )

      if (jupiterResponse.ok) {
        const jupiterQuote = await jupiterResponse.json()
        
        // Transform Jupiter response to our format
        const quote = {
          inputMint: fromToken,
          outputMint: toToken,
          inAmount: amount,
          outAmount: parseInt(jupiterQuote.outAmount),
          priceImpact: parseFloat(jupiterQuote.priceImpactPct || "0"),
          estimatedGas: 5000, // Standard Solana transaction cost
          swapTransaction: null, // Would need separate swap call
          price: parseInt(jupiterQuote.outAmount) / amount,
          route: jupiterQuote.routePlan || [],
          source: "jupiter"
        }
        
        console.log(`Jupiter quote: ${amount} ${fromToken} -> ${quote.outAmount} ${toToken}`)
        return NextResponse.json(quote)
      }
    } catch (jupiterError) {
      console.warn("Jupiter API error, falling back to simulation:", jupiterError)
    }

    // Fallback to simulated quote if Jupiter API fails
    const simulatedQuote = simulateSwapQuote(fromToken, toToken, amount)
    return NextResponse.json(simulatedQuote)
    
  } catch (error) {
    console.error("Error fetching Solana swap quote:", error)
    return NextResponse.json({ error: "Failed to fetch Solana swap quote" }, { status: 500 })
  }
}

// Simulate a swap quote
function simulateSwapQuote(fromToken: string, toToken: string, amount: number) {
  // Generate a deterministic but random-looking price based on the token addresses
  const seed = (fromToken.charCodeAt(0) + toToken.charCodeAt(0)) / 100
  const randomFactor = Math.sin(seed) * 0.2 + 1 // Between 0.8 and 1.2

  // SOL token address
  const SOL_ADDRESS = "So11111111111111111111111111111111111111112"

  let price
  if (fromToken === SOL_ADDRESS) {
    // Buying a token with SOL
    price = 0.00001 * randomFactor
  } else if (toToken === SOL_ADDRESS) {
    // Selling a token for SOL
    price = 0.00001 * (1 / randomFactor)
  } else {
    // Token to token swap
    price = randomFactor
  }

  const outAmount = amount * price
  const estimatedGas = 5000 // Simplified gas estimate

  return {
    inputMint: fromToken,
    outputMint: toToken,
    inAmount: amount,
    outAmount,
    estimatedGas,
    swapTransaction: "base64_encoded_transaction_placeholder",
    price,
    route: [fromToken, "middleToken", toToken],
    source: "simulated",
    priceImpact: Math.abs((price - 1) * 100)
  }
}
