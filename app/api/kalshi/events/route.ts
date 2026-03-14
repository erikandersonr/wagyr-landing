import {
  fetchKalshiSeries,
  fetchKalshiEvents,
  fetchKalshiMarketsByEvent,
  throttledMap,
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
    const status = searchParams.get("status") || "open"
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200)

    if (!categoryId || !(categoryId in KALSHI_CATEGORY_API_NAMES)) {
      return NextResponse.json(
        { error: "Invalid or missing category" },
        { status: 400 }
      )
    }

    const apiCategory = KALSHI_CATEGORY_API_NAMES[categoryId]

    // 1. Fetch all series for this category
    const seriesData = await fetchKalshiSeries({ category: apiCategory, limit: 200 })
    let seriesList = seriesData.series ?? []

    // 2. Filter series by subcategory (coin-based filters reduce series list; time-based filters applied later)
    const timeFilter = SUBCATEGORY_FREQUENCY_FILTERS[categoryId]?.[subcategory]
    if (subcategory === "pre-market") {
      seriesList = seriesList.filter((s) => {
        const t = s.ticker?.toUpperCase() ?? ""
        return PRE_MARKET_PREFIXES.some((p) => t.includes(p))
      })
    } else if (subcategory === "others") {
      seriesList = seriesList.filter((s) => {
        const t = s.ticker?.toUpperCase() ?? ""
        const isCoin = KNOWN_COIN_TICKERS.some((c) => t.includes(c))
        const isPreMarket = PRE_MARKET_PREFIXES.some((p) => t.includes(p))
        return !isCoin && !isPreMarket
      })
    } else if (subcategory === "xrp") {
      seriesList = seriesList.filter((s) => {
        const t = s.ticker?.toUpperCase() ?? ""
        return t.includes("XRP") || t.includes("RIPPLE")
      })
    } else if (!timeFilter && subcategory !== "all") {
      // Coin-based filter (e.g. "btc", "eth", "sol", "doge")
      const sub = subcategory.toUpperCase()
      seriesList = seriesList.filter((s) =>
        s.ticker?.toUpperCase().includes(sub)
      )
    }
    // If timeFilter is set, we fetch ALL series and filter events by close time after Phase 2

    // 3. Phase 1: Lightweight event scan (no nested markets) — throttled at 15 req/sec
    const eventResults = await throttledMap(
      seriesList,
      (s) =>
        fetchKalshiEvents({
          series_ticker: s.ticker,
          status: "open",
          limit: 200,
        }),
      5
    )

    // 4. Flatten all events from Phase 1
    let allEvents: KalshiEvent[] = []
    for (const result of eventResults) {
      if (result.status === "fulfilled") {
        allEvents.push(...(result.value.events ?? []))
      }
    }

    // 5. Deduplicate events before Phase 2 (avoid fetching markets twice for same event)
    const seenPhase1 = new Set<string>()
    allEvents = allEvents.filter((e) => {
      if (seenPhase1.has(e.event_ticker)) return false
      seenPhase1.add(e.event_ticker)
      return true
    })

    // 6. Phase 2: Fetch markets for each event — throttled at 15 req/sec
    const marketResults = await throttledMap(
      allEvents,
      (e) =>
        fetchKalshiMarketsByEvent({
          event_ticker: e.event_ticker,
          limit: 1000,
        }),
      5
    )

    // 7. Attach markets to events and filter to active + initialized
    allEvents = allEvents
      .map((e, i) => {
        const result = marketResults[i]
        const markets =
          result.status === "fulfilled" ? result.value.markets ?? [] : []
        return {
          ...e,
          markets: markets.filter(
            (m) => m.status === "active" || m.status === "initialized"
          ),
        }
      })
      .filter((e) => (e.markets?.length ?? 0) > 0)

    // 8. Apply time-based subcategory filter (by event close time, not series frequency)
    if (timeFilter) {
      const now = new Date()
      const todayEnd = new Date(now)
      todayEnd.setHours(23, 59, 59, 999)
      const weekEnd = new Date(now)
      weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay())) // next Sunday
      weekEnd.setHours(23, 59, 59, 999)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)

      allEvents = allEvents.filter((e) => {
        const earliestClose = Math.min(
          ...(e.markets ?? []).map((m) => new Date(m.close_time).getTime())
        )
        const closeDate = new Date(earliestClose)

        switch (timeFilter) {
          case "fifteen_min":
            // Events closing within the next 30 minutes
            return earliestClose - now.getTime() <= 30 * 60 * 1000 && earliestClose > now.getTime()
          case "hourly":
            // Events closing today
            return closeDate <= todayEnd
          case "daily":
            // Events closing today (same as hourly on Kalshi — they overlap)
            return closeDate <= todayEnd
          case "weekly":
            // Events closing this week (but not today — those are hourly/daily)
            return closeDate > todayEnd && closeDate <= weekEnd
          case "monthly":
            // Events closing this month
            return closeDate > weekEnd && closeDate <= monthEnd
          case "annual":
            // Events closing this year
            return closeDate > monthEnd && closeDate <= yearEnd
          case "one_off":
            // Events closing beyond this year, or custom one-off events
            return closeDate > yearEnd
          default:
            return true
        }
      })
    }

    // 9. Sort by earliest closing market (soonest first)
    allEvents.sort((a, b) => {
      const aClose = Math.min(...(a.markets ?? []).map((m) => new Date(m.close_time).getTime()))
      const bClose = Math.min(...(b.markets ?? []).map((m) => new Date(m.close_time).getTime()))
      return aClose - bClose
    })

    // 10. Slice to limit
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
