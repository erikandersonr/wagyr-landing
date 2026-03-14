import { fetchKalshiMarkets, fetchKalshiMarketsByCategory, fetchMentionsMarkets } from "@/lib/kalshi"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

/** Map app category id (e.g. financials) to Kalshi API category (e.g. Financials). */
const CATEGORY_MAP: Record<string, string> = {
  financials: "Financials",
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") ?? undefined
    const status = searchParams.get("status") || "open"

    // Mentions uses a dedicated fetcher (queries by series ticker)
    if (category === "mentions") {
      const data = await fetchMentionsMarkets({ status })
      return NextResponse.json(data)
    }

    if (category && CATEGORY_MAP[category]) {
      const kalshiCategory = CATEGORY_MAP[category]
      const limit = Math.min(Number(searchParams.get("limit")) || 50, 100)
      const data = await fetchKalshiMarketsByCategory({
        category: kalshiCategory,
        status,
        limit,
      })
      return NextResponse.json(data)
    }

    const limit = Math.min(Number(searchParams.get("limit")) || 24, 100)
    const cursor = searchParams.get("cursor") ?? undefined

    const data = await fetchKalshiMarkets({
      status,
      limit,
      cursor,
      mve_filter: "exclude",
    })

    return NextResponse.json(data)
  } catch (err) {
    console.error("Kalshi markets API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch markets" },
      { status: 500 }
    )
  }
}
