import { fetchKalshiTrades } from "@/lib/kalshi"
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
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200)
    const data = await fetchKalshiTrades(ticker, { limit })
    return NextResponse.json(data)
  } catch (err) {
    console.error("Kalshi trades API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch trades" },
      { status: 500 }
    )
  }
}
