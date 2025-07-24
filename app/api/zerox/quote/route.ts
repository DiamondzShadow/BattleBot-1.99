import { type NextRequest, NextResponse } from "next/server"

// 0x API base URLs for different chains
const ZEROX_API_URLS: Record<number, string> = {
  1: "https://api.0x.org", // Ethereum
  56: "https://bsc.api.0x.org", // BSC
  137: "https://polygon.api.0x.org", // Polygon
  42161: "https://arbitrum.api.0x.org", // Arbitrum
  10: "https://optimism.api.0x.org", // Optimism
  8453: "https://base.api.0x.org", // Base
}

export async function POST(request: NextRequest) {
  try {
    const { chainId, sellToken, buyToken, sellAmount, takerAddress } = await request.json()

    // Get API URL for the chain
    const apiUrl = ZEROX_API_URLS[chainId]
    if (!apiUrl) {
      return NextResponse.json({ error: `Unsupported chain ID: ${chainId}` }, { status: 400 })
    }

    // Build the URL
    const url = new URL(`${apiUrl}/swap/v1/quote`)
    url.searchParams.append("sellToken", sellToken)
    url.searchParams.append("buyToken", buyToken)
    url.searchParams.append("sellAmount", sellAmount)

    if (takerAddress) {
      url.searchParams.append("takerAddress", takerAddress)
    }

    // Add API key if available
    const apiKey = process.env.ZEROX_API_KEY
    const headers: HeadersInit = {
      Accept: "application/json",
    }

    if (apiKey) {
      headers["0x-api-key"] = apiKey
    }

    // Make the request to 0x API
    const response = await fetch(url.toString(), { headers })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `0x API error: ${response.status}`, details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching 0x quote:", error)
    return NextResponse.json({ error: "Failed to fetch 0x quote" }, { status: 500 })
  }
}
