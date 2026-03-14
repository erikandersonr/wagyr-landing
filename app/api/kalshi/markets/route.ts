import { fetchKalshiMarkets } from "@/lib/kalshi"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get("limit")) || 24, 100)
    const cursor = searchParams.get("cursor") ?? undefined
    const status = searchParams.get("status") || "open"

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
