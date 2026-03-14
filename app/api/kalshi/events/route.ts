import {
  fetchKalshiEvents,
  KALSHI_CATEGORY_API_NAMES,
} from "@/lib/kalshi"
import type { KalshiCategoryId, KalshiEvent } from "@/lib/kalshi"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("category") as Exclude<KalshiCategoryId, "home"> | null
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
        // Filter to matching category
        if (e.category !== apiCategory) continue

        // Keep only active/initialized markets
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

    // Deduplicate by event_ticker
    const seen = new Set<string>()
    allEvents = allEvents.filter((e) => {
      if (seen.has(e.event_ticker)) return false
      seen.add(e.event_ticker)
      return true
    })

    // Sort by earliest closing market (soonest first)
    allEvents.sort((a, b) => {
      const aClose = Math.min(...(a.markets ?? []).map((m) => new Date(m.close_time).getTime()))
      const bClose = Math.min(...(b.markets ?? []).map((m) => new Date(m.close_time).getTime()))
      return aClose - bClose
    })

    // Slice to limit
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
