import {
  fetchKalshiEvents,
  KALSHI_CATEGORY_API_NAMES,
  SUBCATEGORY_FREQUENCY_FILTERS,
  PRE_MARKET_PREFIXES,
  KNOWN_COIN_TICKERS,
} from "@/lib/kalshi"
import type { KalshiCategoryId, KalshiEvent } from "@/lib/kalshi"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("category") as Exclude<KalshiCategoryId, "home"> | null
    const subcategory = searchParams.get("subcategory") ?? "all"
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200)

    if (!categoryId || !(categoryId in KALSHI_CATEGORY_API_NAMES)) {
      return NextResponse.json(
        { error: "Invalid or missing category" },
        { status: 400 }
      )
    }

    const apiCategory = KALSHI_CATEGORY_API_NAMES[categoryId]

    // Paginate through open events, filter by category server-side
    let allEvents: KalshiEvent[] = []
    let cursor: string | undefined
    const maxPages = 10

    for (let page = 0; page < maxPages; page++) {
      const data = await fetchKalshiEvents({
        status: "open",
        limit: 200,
        with_nested_markets: true,
        cursor,
      })

      for (const e of data.events ?? []) {
        if (e.category !== apiCategory) continue

        const activeMarkets = (e.markets ?? []).filter(
          (m) => m.status === "active" || m.status === "initialized"
        )
        if (activeMarkets.length > 0) {
          allEvents.push({ ...e, markets: activeMarkets })
        }
      }

      if (!data.cursor || allEvents.length >= limit) break
      cursor = data.cursor
    }

    // Deduplicate
    const seen = new Set<string>()
    allEvents = allEvents.filter((e) => {
      if (seen.has(e.event_ticker)) return false
      seen.add(e.event_ticker)
      return true
    })

    // Apply subcategory filter
    if (subcategory !== "all") {
      const timeFilter = SUBCATEGORY_FREQUENCY_FILTERS[categoryId]?.[subcategory]

      if (timeFilter) {
        // Time-based: filter by event close time
        const now = new Date()
        const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999)
        const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay())); weekEnd.setHours(23, 59, 59, 999)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)

        allEvents = allEvents.filter((e) => {
          const close = new Date(Math.min(...(e.markets ?? []).map((m) => new Date(m.close_time).getTime())))
          switch (timeFilter) {
            case "fifteen_min": return close.getTime() - now.getTime() <= 30 * 60 * 1000 && close > now
            case "hourly": return close <= todayEnd
            case "daily": return close <= todayEnd
            case "weekly": return close > todayEnd && close <= weekEnd
            case "monthly": return close > weekEnd && close <= monthEnd
            case "annual": return close > monthEnd && close <= yearEnd
            case "one_off": return close > yearEnd
            default: return true
          }
        })
      } else if (subcategory === "pre-market") {
        allEvents = allEvents.filter((e) => {
          const t = e.series_ticker?.toUpperCase() ?? ""
          return PRE_MARKET_PREFIXES.some((p) => t.includes(p))
        })
      } else if (subcategory === "others") {
        allEvents = allEvents.filter((e) => {
          const t = e.series_ticker?.toUpperCase() ?? ""
          return !KNOWN_COIN_TICKERS.some((c) => t.includes(c)) &&
                 !PRE_MARKET_PREFIXES.some((p) => t.includes(p))
        })
      } else if (subcategory === "xrp") {
        allEvents = allEvents.filter((e) => {
          const t = e.series_ticker?.toUpperCase() ?? ""
          return t.includes("XRP") || t.includes("RIPPLE")
        })
      } else {
        // Ticker-based filter (btc, eth, sol, doge, congress, etc.)
        const sub = subcategory.toUpperCase()
        allEvents = allEvents.filter((e) =>
          e.series_ticker?.toUpperCase().includes(sub)
        )
      }
    }

    // Sort by earliest closing market (soonest first)
    allEvents.sort((a, b) => {
      const aClose = Math.min(...(a.markets ?? []).map((m) => new Date(m.close_time).getTime()))
      const bClose = Math.min(...(b.markets ?? []).map((m) => new Date(m.close_time).getTime()))
      return aClose - bClose
    })

    allEvents = allEvents.slice(0, limit)

    return NextResponse.json({ events: allEvents })
  } catch (err) {
    console.error("Kalshi events API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch events" },
      { status: 500 }
    )
  }
}
