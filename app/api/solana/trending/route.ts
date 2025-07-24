import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // In production, this would call an API to get trending Solana tokens
    // For now, we'll simulate a response

    const trendingTokens = []

    // Generate 10 fake trending tokens
    for (let i = 0; i < 10; i++) {
      // Generate a random address-like string
      const address = Array(44)
        .fill(0)
        .map(() => Math.floor(Math.random() * 36).toString(36))
        .join("")

      // Generate a deterministic name and symbol
      const addressShort = address.slice(0, 8)
      const name = `Trending Solana ${i + 1}`
      const symbol = `TSOL${i + 1}`

      trendingTokens.push({
        address,
        name,
        symbol,
        decimals: 9,
        supply: (Math.random() * 1000000000).toString(),
        logoUrl: `https://via.placeholder.com/64/${addressShort}?text=${symbol}`,
        price: Math.random() * 10,
        volume24h: Math.random() * 1000000,
        marketCap: Math.random() * 10000000,
        priceChange24h: Math.random() * 20 - 10,
      })
    }

    return NextResponse.json(trendingTokens)
  } catch (error) {
    console.error("Solana trending API error:", error)
    return NextResponse.json({ error: "Failed to fetch trending Solana tokens" }, { status: 500 })
  }
}
