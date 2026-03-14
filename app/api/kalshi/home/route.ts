import { fetchKalshiEvents, KalshiEvent, KalshiMarket } from "@/lib/kalshi"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

// The major Kalshi categories we want on the homepage
const CORE_CATEGORIES = [
  "Crypto",
  "Financials",
  "Politics",
  "Science and Technology",
  "Economics",
]

function getEventVolume(event: KalshiEvent): number {
  if (!event.markets) return 0
  return event.markets.reduce((sum, m) => {
    if (m.status !== "active") return sum
    return sum + (parseFloat(m.volume_fp ?? "0") || 0)
  }, 0)
}

function getEvent24hVolume(event: KalshiEvent): number {
  if (!event.markets) return 0
  return event.markets.reduce((sum, m) => {
    if (m.status !== "active") return sum
    return sum + (parseFloat(m.volume_24h_fp ?? "0") || 0)
  }, 0)
}

export async function GET() {
  try {
    let allEvents: KalshiEvent[] = []

    // Fetch events sequentially to avoid 429 rate limits, we only need a single page of 50 per category
    for (const category of CORE_CATEGORIES) {
      // Small delay between categories
      if (allEvents.length > 0) await new Promise((r) => setTimeout(r, 100))
      
      try {
        const data = await fetchKalshiEvents({
          category,
          status: "open",
          limit: 50,
          with_nested_markets: true,
        })
        
        const validEvents = (data.events ?? []).filter((e) => {
          // Strict category filtering to avoid API bleed
          if (e.category !== category) return false
          const activeMarkets = (e.markets ?? []).filter(m => m.status === "active")
          if (activeMarkets.length === 0) return false
          
          // Re-attach active only markets
          e.markets = activeMarkets
          return true
        })

        allEvents.push(...validEvents)
      } catch (err) {
        console.warn(`Failed to fetch category ${category} for home feed:`, err)
      }
    }

    // Deduplicate by event_ticker
    const seen = new Set<string>()
    allEvents = allEvents.filter((e) => {
      if (seen.has(e.event_ticker)) return false
      seen.add(e.event_ticker)
      return true
    })

    // Sort globally by total volume to find the biggest market (Featured)
    allEvents.sort((a, b) => getEventVolume(b) - getEventVolume(a))

    const featured = allEvents.length > 0 ? allEvents[0] : null
    
    // Sort by 24h volume for "Breaking/Moving"
    const by24h = [...allEvents].sort((a, b) => getEvent24hVolume(b) - getEvent24hVolume(a))
    const breaking = by24h.filter(e => e.event_ticker !== featured?.event_ticker).slice(0, 3)

    // The rest of the top 12 highest volume events form the slate
    const usedTickers = new Set([featured?.event_ticker, ...breaking.map(e => e.event_ticker)])
    const slate = allEvents.filter(e => !usedTickers.has(e.event_ticker)).slice(0, 12)

    return NextResponse.json({
      featured,
      breaking,
      slate,
    })
  } catch (err) {
    console.error("Kalshi home API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch home feed" },
      { status: 500 }
    )
  }
}
