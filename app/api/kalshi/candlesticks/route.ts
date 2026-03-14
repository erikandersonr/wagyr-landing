import { fetchKalshiCandlesticks } from "@/lib/kalshi"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ticker = searchParams.get("ticker")
    const seriesTicker = searchParams.get("series_ticker")
    if (!ticker || !seriesTicker) {
      return NextResponse.json({ error: "Missing ticker or series_ticker" }, { status: 400 })
    }
    const period_interval = Number(searchParams.get("period_interval")) || undefined
    const candlesticks = await fetchKalshiCandlesticks(ticker, seriesTicker, { period_interval })
    return NextResponse.json({ candlesticks })
  } catch (err) {
    console.error("Kalshi candlesticks API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch candlesticks" },
      { status: 500 }
    )
  }
}
