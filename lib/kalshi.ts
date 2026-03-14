const KALSHI_API = "https://api.elections.kalshi.com/trade-api/v2"

export type KalshiMarket = {
  ticker: string
  event_ticker: string
  title: string
  subtitle: string
  yes_sub_title: string
  no_sub_title: string
  status: string
  market_type: string
  yes_bid_dollars: string
  yes_ask_dollars: string
  no_bid_dollars: string
  no_ask_dollars: string
  last_price_dollars: string
  previous_yes_bid_dollars: string
  previous_price_dollars: string
  volume_fp: string
  volume_24h_fp: string
  close_time: string
  series_ticker?: string
}

export type KalshiMarketsResponse = {
  markets: KalshiMarket[]
  cursor: string
}

export type KalshiEvent = {
  event_ticker: string
  series_ticker: string
  title: string
  category?: string
  status: string
  markets?: KalshiMarket[]
}

export type KalshiEventsResponse = {
  events: KalshiEvent[]
  cursor: string
}

/** YES probability 0–100 from yes bid (dollars 0–1). */
export function yesPercent(m: KalshiMarket): number {
  const bid = parseFloat(m.yes_bid_dollars ?? "0")
  return Math.round(bid * 100)
}

/** NO probability 0–100 (complement or from no side). */
export function noPercent(m: KalshiMarket): number {
  const ask = parseFloat(m.yes_ask_dollars ?? "1")
  if (ask > 0 && ask < 1) return Math.round((1 - ask) * 100)
  return 100 - yesPercent(m)
}

/** Approx 24h change in YES % (previous_yes_bid vs current yes_bid). */
export function yesChangePercent(m: KalshiMarket): number {
  const prev = parseFloat(m.previous_yes_bid_dollars ?? "0")
  const curr = parseFloat(m.yes_bid_dollars ?? "0")
  return Math.round((curr - prev) * 100)
}

/** Volume as number (contracts). */
export function volume(m: KalshiMarket): number {
  return parseFloat(m.volume_fp ?? "0") || 0
}

export function volume24h(m: KalshiMarket): number {
  return parseFloat(m.volume_24h_fp ?? "0") || 0
}

/** Human-readable theme from series_ticker (e.g. KXNHL -> Sports). */
export function themeFromSeries(seriesTicker: string | undefined): string {
  if (!seriesTicker) return "Markets"
  const s = seriesTicker.toUpperCase()
  if (s.startsWith("KXFED") || s.includes("RATE")) return "Fed policy"
  if (s.startsWith("KXGEO") || s.includes("ELECT") || s.includes("TARIFF")) return "Geopolitics"
  if (s.startsWith("KXSP") || s.startsWith("KXBTC") || s.includes("CRYPTO")) return "Finance"
  if (s.startsWith("KXNHL") || s.startsWith("KXNBA") || s.startsWith("KXEPL")) return "Sports"
  if (s.startsWith("KX")) return s.replace(/^KX/, "").slice(0, 12) || "Markets"
  return "Markets"
}

export async function fetchKalshiMarkets(params: {
  status?: string
  limit?: number
  cursor?: string
  mve_filter?: "exclude" | "only"
}): Promise<KalshiMarketsResponse> {
  const searchParams = new URLSearchParams()
  if (params.status) searchParams.set("status", params.status)
  if (params.limit != null) searchParams.set("limit", String(params.limit))
  if (params.cursor) searchParams.set("cursor", params.cursor)
  if (params.mve_filter) searchParams.set("mve_filter", params.mve_filter)

  const url = `${KALSHI_API}/markets?${searchParams.toString()}`
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Kalshi API error: ${res.status}`)
  return res.json() as Promise<KalshiMarketsResponse>
}

export async function fetchKalshiEvents(params: {
  status?: string
  limit?: number
  cursor?: string
  with_nested_markets?: boolean
}): Promise<KalshiEventsResponse> {
  const searchParams = new URLSearchParams()
  if (params.status) searchParams.set("status", params.status)
  if (params.limit != null) searchParams.set("limit", String(params.limit))
  if (params.cursor) searchParams.set("cursor", params.cursor)
  if (params.with_nested_markets) searchParams.set("with_nested_markets", "true")

  const url = `${KALSHI_API}/events?${searchParams.toString()}`
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Kalshi API error: ${res.status}`)
  return res.json() as Promise<KalshiEventsResponse>
}
