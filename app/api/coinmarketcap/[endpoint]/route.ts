import { type NextRequest, NextResponse } from "next/server"

// CoinMarketCap API key
const CMC_API_KEY = process.env.COINMARKETCAP_API_KEY || "22e35657-2bee-48d9-8d3e-ca2ccf8c8bd1"
const CMC_API_BASE_URL = "https://pro-api.coinmarketcap.com/v1"

export async function POST(request: NextRequest, { params }: { params: { endpoint: string } }) {
  try {
    const { endpoint } = params
    const { params: queryParams } = await request.json()

    // Build URL with query parameters
    const url = new URL(`${CMC_API_BASE_URL}/${endpoint}`)

    // Add query parameters
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value as string)
      })
    }

    // Make request to CoinMarketCap API
    const response = await fetch(url.toString(), {
      headers: {
        "X-CMC_PRO_API_KEY": CMC_API_KEY,
        Accept: "application/json",
      },
    })

    // Get response data
    const data = await response.json()

    // Return response
    return NextResponse.json(data)
  } catch (error) {
    console.error("CoinMarketCap API error:", error)
    return NextResponse.json({ error: "Failed to fetch data from CoinMarketCap" }, { status: 500 })
  }
}
