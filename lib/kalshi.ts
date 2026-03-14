const KALSHI_API = "https://api.elections.kalshi.com/trade-api/v2"

/** All Kalshi market categories, matching their site taxonomy. */
export const KALSHI_CATEGORIES = [
  { id: "home", label: "Home" },
  { id: "politics", label: "Politics" },
  { id: "sports", label: "Sports" },
  { id: "culture", label: "Culture" },
  { id: "crypto", label: "Crypto" },
  { id: "climate", label: "Climate" },
  { id: "economics", label: "Economics" },
  { id: "mentions", label: "Mentions" },
  { id: "companies", label: "Companies" },
  { id: "financials", label: "Financials" },
  { id: "tech-science", label: "Tech & Science" },
] as const

export type KalshiCategoryId = (typeof KALSHI_CATEGORIES)[number]["id"]

/** Subcategories for each Kalshi market category, sourced from their API. */
export const KALSHI_SUBCATEGORIES: Record<
  Exclude<KalshiCategoryId, "home">,
  { id: string; label: string }[]
> = {
  politics: [
    { id: "all", label: "All markets" },
    { id: "congress", label: "Congress" },
    { id: "foreign-elections", label: "Foreign Elections" },
    { id: "house", label: "House" },
    { id: "international", label: "International" },
    { id: "iran", label: "Iran" },
    { id: "local", label: "Local" },
    { id: "primaries", label: "Primaries" },
    { id: "recurring", label: "Recurring" },
    { id: "scotus-courts", label: "SCOTUS & courts" },
    { id: "trump", label: "Trump" },
    { id: "us-elections", label: "US Elections" },
  ],
  sports: [
    { id: "all", label: "All markets" },
    { id: "soccer", label: "Soccer" },
    { id: "basketball", label: "Basketball" },
    { id: "baseball", label: "Baseball" },
    { id: "football", label: "Football" },
    { id: "hockey", label: "Hockey" },
    { id: "golf", label: "Golf" },
    { id: "tennis", label: "Tennis" },
    { id: "motorsport", label: "Motorsport" },
    { id: "esports", label: "Esports" },
    { id: "mma", label: "MMA" },
    { id: "boxing", label: "Boxing" },
    { id: "rugby", label: "Rugby" },
    { id: "cricket", label: "Cricket" },
    { id: "lacrosse", label: "Lacrosse" },
    { id: "chess", label: "Chess" },
    { id: "aussie-rules", label: "Aussie Rules" },
    { id: "darts", label: "Darts" },
  ],
  culture: [
    { id: "all", label: "All markets" },
    { id: "music", label: "Music" },
    { id: "movies", label: "Movies" },
    { id: "awards", label: "Awards" },
    { id: "television", label: "Television" },
    { id: "music-charts", label: "Music charts" },
    { id: "video-games", label: "Video games" },
    { id: "grammys", label: "Grammys" },
    { id: "rotten-tomatoes", label: "Rotten Tomatoes" },
  ],
  crypto: [
    { id: "all", label: "All markets" },
    { id: "btc", label: "BTC" },
    { id: "15-min", label: "15 min" },
    { id: "hourly", label: "Hourly" },
    { id: "eth", label: "ETH" },
    { id: "sol", label: "SOL" },
    { id: "doge", label: "DOGE" },
    { id: "pre-market", label: "Pre-Market" },
    { id: "xrp", label: "XRP" },
  ],
  climate: [
    { id: "all", label: "All markets" },
    { id: "daily-temperature", label: "Daily temperature" },
    { id: "snow-rain", label: "Snow and rain" },
    { id: "climate-change", label: "Climate change" },
    { id: "natural-disasters", label: "Natural disasters" },
    { id: "hurricanes", label: "Hurricanes" },
  ],
  economics: [
    { id: "all", label: "All markets" },
    { id: "growth", label: "Growth" },
    { id: "fed", label: "Fed" },
    { id: "oil-energy", label: "Oil and energy" },
    { id: "inflation", label: "Inflation" },
    { id: "housing", label: "Housing" },
    { id: "employment", label: "Employment" },
    { id: "jobs-economy", label: "Jobs & Economy" },
    { id: "bankruptcy-defaults", label: "Bankruptcy & Defaults" },
    { id: "gdp", label: "GDP" },
    { id: "global-central-banks", label: "Global Central Banks" },
  ],
  mentions: [
    { id: "all", label: "All markets" },
    { id: "sports", label: "Sports" },
    { id: "politicians", label: "Politicians" },
    { id: "earnings", label: "Earnings" },
    { id: "entertainment", label: "Entertainment" },
  ],
  companies: [
    { id: "all", label: "All markets" },
    { id: "ipos", label: "IPOs" },
    { id: "product-launches", label: "Product launches" },
    { id: "kpis", label: "KPIs" },
    { id: "elon-musk", label: "Elon Musk" },
    { id: "ceos", label: "CEOs" },
    { id: "layoffs", label: "Layoffs" },
  ],
  financials: [
    { id: "all", label: "All markets" },
    { id: "sp", label: "S&P" },
    { id: "nasdaq", label: "Nasdaq" },
    { id: "daily", label: "Daily" },
    { id: "treasuries", label: "Treasuries" },
    { id: "metals", label: "Metals" },
    { id: "wti", label: "WTI" },
    { id: "eur-usd", label: "EUR/USD" },
    { id: "usd-jpy", label: "USD/JPY" },
  ],
  "tech-science": [
    { id: "all", label: "All markets" },
    { id: "ai", label: "AI" },
    { id: "energy", label: "Energy" },
    { id: "space", label: "Space" },
  ],
}

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

/** Map series_ticker to a Kalshi category label. */
export function themeFromSeries(seriesTicker: string | undefined): string {
  if (!seriesTicker) return "Markets"
  const s = seriesTicker.toUpperCase()
  if (s.includes("ELECT") || s.includes("TARIFF") || s.startsWith("KXGEO")) return "Politics"
  if (s.startsWith("KXNHL") || s.startsWith("KXNBA") || s.startsWith("KXEPL") || s.startsWith("KXMLB") || s.startsWith("KXMMA") || s.startsWith("KXNFL")) return "Sports"
  if (s.startsWith("KXBTC") || s.startsWith("KXETH") || s.includes("CRYPTO")) return "Crypto"
  if (s.startsWith("KXFED") || s.includes("RATE") || s.includes("CPI") || s.includes("GDP") || s.includes("JOBS")) return "Economics"
  if (s.startsWith("KXSP") || s.includes("NASDAQ")) return "Financials"
  if (s.includes("CLIMATE") || s.includes("HURRICANE") || s.includes("TEMP")) return "Climate"
  if (s.includes("OSCAR") || s.includes("GRAMMY") || s.includes("BILLBOARD")) return "Culture"
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
  category?: string
  with_nested_markets?: boolean
}): Promise<KalshiEventsResponse> {
  const searchParams = new URLSearchParams()
  if (params.status) searchParams.set("status", params.status)
  if (params.limit != null) searchParams.set("limit", String(params.limit))
  if (params.cursor) searchParams.set("cursor", params.cursor)
  if (params.category) searchParams.set("category", params.category)
  if (params.with_nested_markets) searchParams.set("with_nested_markets", "true")

  const url = `${KALSHI_API}/events?${searchParams.toString()}`
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Kalshi API error: ${res.status}`)
  return res.json() as Promise<KalshiEventsResponse>
}

/** Fetch markets for a given Kalshi category (e.g. Financials) by loading events and flattening nested markets. */
export async function fetchKalshiMarketsByCategory(params: {
  category: string
  status?: string
  limit?: number
}): Promise<{ markets: KalshiMarket[] }> {
  const limit = params.limit ?? 100
  const data = await fetchKalshiEvents({
    status: params.status ?? "open",
    limit,
    category: params.category,
    with_nested_markets: true,
  })
  const markets: KalshiMarket[] = []
  for (const event of data.events ?? []) {
    if (event.category !== params.category) continue
    for (const m of event.markets ?? []) {
      markets.push({
        ...m,
        series_ticker: event.series_ticker,
      } as KalshiMarket)
    }
  }
  return { markets }
}
