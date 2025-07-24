import { type NextRequest, NextResponse } from "next/server"

// Solana RPC URL
const SOLANA_RPC_URL = process.env.QUIKNODE_SOLANA_RPC || "https://api.mainnet-beta.solana.com"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Token address is required" }, { status: 400 })
    }

    // In production, this would call the Solana RPC to get token data
    // For now, we'll simulate a response

    // Generate a deterministic name and symbol based on address
    const addressShort = address.slice(0, 8)
    const name = `Solana Token ${addressShort}`
    const symbol = `SOL${addressShort.slice(0, 3).toUpperCase()}`

    const tokenData = {
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
    }

    return NextResponse.json(tokenData)
  } catch (error) {
    console.error("Solana API error:", error)
    return NextResponse.json({ error: "Failed to fetch Solana token data" }, { status: 500 })
  }
}
