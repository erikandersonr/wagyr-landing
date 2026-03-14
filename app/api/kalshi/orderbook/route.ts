import { fetchKalshiOrderbook } from "@/lib/kalshi"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ticker = searchParams.get("ticker")
    if (!ticker) {
      return NextResponse.json({ error: "Missing ticker" }, { status: 400 })
    }
    const orderbook = await fetchKalshiOrderbook(ticker)
    return NextResponse.json({ orderbook })
  } catch (err) {
    console.error("Kalshi orderbook API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch orderbook" },
      { status: 500 }
    )
  }
}
