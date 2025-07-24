"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search } from "lucide-react"
import { SUPPORTED_CHAINS } from "@/lib/trading-service"
import { getCoinMarketCapService } from "@/lib/coinmarketcap-service"

interface TokenSearchProps {
  onTokenSelect: (tokenAddress: string, chain: string) => void
}

interface TokenResult {
  address: string
  name: string
  symbol: string
  chain: string
  logoUrl?: string
}

export function TokenSearch({ onTokenSelect }: TokenSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChain, setSelectedChain] = useState("bsc")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<TokenResult[]>([])
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError("")

    try {
      // Use CoinMarketCap API for token search
      const cmcService = getCoinMarketCapService()
      const cmcResults = await cmcService.searchTokens(searchQuery, selectedChain)

      if (cmcResults && cmcResults.length > 0) {
        // Transform CMC results to our format
        const transformedResults = cmcResults
          .map((token) => ({
            address: token.platform?.token_address || "",
            name: token.name,
            symbol: token.symbol,
            chain: token.platform?.slug || selectedChain,
            logoUrl: `https://s2.coinmarketcap.com/static/img/coins/64x64/${token.id}.png`,
          }))
          .filter((token) => token.address) // Only include tokens with addresses

        setSearchResults(transformedResults)

        if (transformedResults.length === 0) {
          setError("No tokens found matching your search criteria")
        }

        setIsSearching(false)
        return
      }

      // If no results from CMC, fall back to our sample data
      // Sample token data for different chains
      const bscTokens = [
        {
          address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
          name: "Wrapped BNB",
          symbol: "WBNB",
          chain: "bsc",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/7192.png",
        },
        {
          address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
          name: "PancakeSwap Token",
          symbol: "CAKE",
          chain: "bsc",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/7186.png",
        },
        {
          address: "0x55d398326f99059fF775485246999027B3197955",
          name: "Tether USD",
          symbol: "USDT",
          chain: "bsc",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
        },
        {
          address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
          name: "USD Coin",
          symbol: "USDC",
          chain: "bsc",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
        },
        {
          address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
          name: "Bitcoin BEP2",
          symbol: "BTCB",
          chain: "bsc",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/4023.png",
        },
      ]

      const polygonTokens = [
        {
          address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
          name: "Wrapped Matic",
          symbol: "WMATIC",
          chain: "polygon",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/8925.png",
        },
        {
          address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          name: "USD Coin",
          symbol: "USDC",
          chain: "polygon",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
        },
        {
          address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
          name: "Tether USD",
          symbol: "USDT",
          chain: "polygon",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
        },
        {
          address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
          name: "Wrapped BTC",
          symbol: "WBTC",
          chain: "polygon",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png",
        },
        {
          address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
          name: "Wrapped Ether",
          symbol: "WETH",
          chain: "polygon",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/2396.png",
        },
      ]

      const arbitrumTokens = [
        {
          address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
          name: "Wrapped Ether",
          symbol: "WETH",
          chain: "arbitrum",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/2396.png",
        },
        {
          address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
          name: "USD Coin",
          symbol: "USDC",
          chain: "arbitrum",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
        },
        {
          address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
          name: "Tether USD",
          symbol: "USDT",
          chain: "arbitrum",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
        },
        {
          address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
          name: "Wrapped BTC",
          symbol: "WBTC",
          chain: "arbitrum",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png",
        },
        {
          address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
          name: "Arbitrum",
          symbol: "ARB",
          chain: "arbitrum",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png",
        },
      ]

      const optimismTokens = [
        {
          address: "0x4200000000000000000000000000000000000006",
          name: "Wrapped Ether",
          symbol: "WETH",
          chain: "optimism",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/2396.png",
        },
        {
          address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
          name: "USD Coin",
          symbol: "USDC",
          chain: "optimism",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
        },
        {
          address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
          name: "Tether USD",
          symbol: "USDT",
          chain: "optimism",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
        },
        {
          address: "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
          name: "Wrapped BTC",
          symbol: "WBTC",
          chain: "optimism",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png",
        },
        {
          address: "0x4200000000000000000000000000000000000042",
          name: "Optimism",
          symbol: "OP",
          chain: "optimism",
          logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/11840.png",
        },
      ]

      // Select tokens based on the selected chain
      let availableTokens: TokenResult[] = []
      switch (selectedChain) {
        case "bsc":
          availableTokens = bscTokens
          break
        case "polygon":
          availableTokens = polygonTokens
          break
        case "arbitrum":
          availableTokens = arbitrumTokens
          break
        case "optimism":
          availableTokens = optimismTokens
          break
        default:
          availableTokens = [...bscTokens, ...polygonTokens, ...arbitrumTokens, ...optimismTokens]
      }

      // Filter tokens based on search query
      const query = searchQuery.toLowerCase()
      const filteredTokens = availableTokens.filter(
        (token) =>
          token.name.toLowerCase().includes(query) ||
          token.symbol.toLowerCase().includes(query) ||
          token.address.toLowerCase().includes(query),
      )

      if (filteredTokens.length === 0) {
        setError("No tokens found matching your search criteria")
      }

      setSearchResults(filteredTokens)
    } catch (err) {
      console.error("Token search error:", err)
      setError("Failed to search for tokens. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Search</CardTitle>
        <CardDescription>Search for tokens by name or symbol</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <Label htmlFor="search-query">Token Name or Symbol</Label>
              <div className="relative">
                <Input
                  id="search-query"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div>
              <Label htmlFor="search-chain">Blockchain</Label>
              <Select value={selectedChain} onValueChange={setSelectedChain}>
                <SelectTrigger id="search-chain">
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUPPORTED_CHAINS).map(([id, chain]) => (
                    <SelectItem key={id} value={id}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {isSearching ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-5 p-3 bg-muted text-sm font-medium">
                <div className="col-span-1">Logo</div>
                <div className="col-span-1">Symbol</div>
                <div className="col-span-2">Name</div>
                <div className="col-span-1">Chain</div>
              </div>
              <div className="divide-y">
                {searchResults.map((token) => (
                  <div
                    key={`${token.chain}-${token.address}`}
                    className="grid grid-cols-5 p-3 text-sm hover:bg-muted/50 cursor-pointer"
                    onClick={() => onTokenSelect(token.address, token.chain)}
                  >
                    <div className="col-span-1 flex items-center">
                      {token.logoUrl ? (
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-muted">
                          <img
                            src={token.logoUrl || "/placeholder.svg"}
                            alt={token.symbol}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // Fallback if logo fails to load
                              e.currentTarget.src = `/placeholder.svg?height=32&width=32&query=${token.symbol}`
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs font-bold">{token.symbol.substring(0, 2)}</span>
                        </div>
                      )}
                    </div>
                    <div className="col-span-1 font-medium flex items-center">{token.symbol}</div>
                    <div className="col-span-2 flex items-center">{token.name}</div>
                    <div className="col-span-1 flex items-center">
                      {SUPPORTED_CHAINS[token.chain]?.name || token.chain}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()} className="w-full">
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search Tokens
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
