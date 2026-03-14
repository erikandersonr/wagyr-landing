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
    // By frequency
    { id: "all", label: "All markets" },
    { id: "15-min", label: "15 Minute" },
    { id: "hourly", label: "Hourly" },
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "annual", label: "Annual" },
    { id: "one-time", label: "One Time" },
    // By coin (separator rendered in UI)
    { id: "---", label: "---" },
    { id: "btc", label: "BTC" },
    { id: "eth", label: "ETH" },
    { id: "sol", label: "SOL" },
    { id: "xrp", label: "XRP" },
    { id: "doge", label: "DOGE" },
    { id: "pre-market", label: "Pre-Market" },
    { id: "others", label: "Others" },
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

/** Maps our category IDs to Kalshi's API category names (title case). */
export const KALSHI_CATEGORY_API_NAMES: Record<Exclude<KalshiCategoryId, "home">, string> = {
  politics: "Politics",
  sports: "Sports",
  culture: "Entertainment",
  crypto: "Crypto",
  climate: "Climate and Weather",
  economics: "Economics",
  mentions: "Mentions",
  companies: "Companies",
  financials: "Financials",
  "tech-science": "Science and Technology",
}

/** Subcategories that filter by series frequency instead of ticker. */
export const SUBCATEGORY_FREQUENCY_FILTERS: Partial<Record<string, Record<string, string>>> = {
  crypto: {
    "15-min": "fifteen_min",
    hourly: "hourly",
    daily: "daily",
    weekly: "weekly",
    monthly: "monthly",
    annual: "annual",
    "one-time": "one_off",
  },
}

/** Ticker prefixes that identify pre-market series. */
export const PRE_MARKET_PREFIXES = ["FDV", "AIRDROP", "TOKENLAUNCH", "NEWCOIN"]

/** Ticker substrings that identify known coin series. */
export const KNOWN_COIN_TICKERS = ["BTC", "ETH", "SOL", "XRP", "RIPPLE", "DOGE", "SHIBA"]

export type KalshiSeries = {
  ticker: string
  title: string
  category: string
  frequency?: string
  tags?: string[] | null
}

export type KalshiSeriesResponse = {
  series: KalshiSeries[]
  cursor: string
}

export type KalshiMarket = {
  ticker: string
  event_ticker: string
  title: string
  subtitle: string
  yes_sub_title: string
  no_sub_title: string
  status: string
  result: string
  market_type: string
  strike_type: string
  floor_strike: number | null
  cap_strike: number | null
  yes_bid_dollars: string
  yes_ask_dollars: string
  no_bid_dollars: string
  no_ask_dollars: string
  last_price_dollars: string
  previous_yes_bid_dollars: string
  previous_yes_ask_dollars: string
  previous_price_dollars: string
  volume_fp: string
  volume_24h_fp: string
  open_interest_fp: string
  open_time: string
  close_time: string
  expected_expiration_time: string
  notional_value_dollars: string
  rules_primary: string
  rules_secondary: string
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
  sub_title: string
  category?: string
  status: string
  mutually_exclusive: boolean
  strike_date?: string
  available_on_brokers: boolean
  markets?: KalshiMarket[]
}

/** Format the title for a UI card, appending the specific answer if the event represents a mutually exclusive question. */
export function formatEventTitle(event: KalshiEvent, market?: KalshiMarket | null): string {
  if (!market) return event.title
  if (event.mutually_exclusive && market.yes_sub_title) {
    return `${event.title} (${market.yes_sub_title})`
  }
  return event.title
}

export type KalshiEventsResponse = {
  events: KalshiEvent[]
  cursor: string
}

export type KalshiOrderbook = {
  yes: [string, string][]
  no: [string, string][]
}

export type KalshiCandlestick = {
  end_period_ts: number
  yes_bid: { open_dollars: string; high_dollars: string; low_dollars: string; close_dollars: string }
  yes_ask: { open_dollars: string; high_dollars: string; low_dollars: string; close_dollars: string }
  price: { open_dollars: string | null; high_dollars: string | null; low_dollars: string | null; close_dollars: string | null; mean_dollars: string | null }
  volume_fp: string
  open_interest_fp: string
}

export type KalshiTrade = {
  trade_id: string
  ticker: string
  count_fp: string
  yes_price_dollars: string
  no_price_dollars: string
  taker_side: string
  created_time: string
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

/** Open interest as number. */
export function openInterest(m: KalshiMarket): number {
  return parseFloat(m.open_interest_fp ?? "0") || 0
}

/** Bid-ask spread in dollars. */
export function spreadDollars(m: KalshiMarket): number {
  const bid = parseFloat(m.yes_bid_dollars ?? "0")
  const ask = parseFloat(m.yes_ask_dollars ?? "0")
  return Math.round((ask - bid) * 100) / 100
}

/** Human-readable time until market closes. */
export function timeUntilClose(m: KalshiMarket): string {
  const now = new Date()
  const close = new Date(m.close_time)
  const diff = close.getTime() - now.getTime()
  if (diff <= 0) return "Closed"
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

/** Format volume for display. */
export function formatVol(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
  return `$${Math.round(v)}`
}

/** Format close time for display. */
export function formatClose(closeTime: string): string {
  try {
    const d = new Date(closeTime)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  } catch {
    return "—"
  }
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

/** Map a Financials market to our sidebar subcategory id (for filtering). */
export function getFinancialsSubcategoryId(m: KalshiMarket): string {
  const s = (m.series_ticker ?? m.event_ticker ?? "").toUpperCase()
  if (/KXSP|^SP|S&P/.test(s)) return "sp"
  if (/NASDAQ|NDX|KXNDX/.test(s)) return "nasdaq"
  if (/DAILY|DILY/.test(s)) return "daily"
  if (/TREASURY|TNOTE|TBOND|KXT/.test(s)) return "treasuries"
  if (/GOLD|SILVER|METAL|KXGOLD|KXAG/.test(s)) return "metals"
  if (/WTI|CRUDE|KXCL|KXWTI/.test(s)) return "wti"
  if (/EURUSD|EUR\/USD|EURUS|KXEUR/.test(s)) return "eur-usd"
  if (/USDJPY|USD\/JPY|USDJP|KXUSDJP|KXJPY/.test(s)) return "usd-jpy"
  return "all"
}

/** Map a Mentions market to our sidebar subcategory id (for filtering). */
export function getMentionsSubcategoryId(m: KalshiMarket): string {
  const t = (m.title ?? "").toUpperCase()
  const s = (m.series_ticker ?? m.event_ticker ?? "").toUpperCase()
  // Sports-related mentions
  if (/NFL|NBA|MLB|NHL|MLS|NCAA|UFC|FIFA|ESPN|SPORT|COACH|PLAYER|TEAM|GAME|MATCH/.test(t) || /SPORT/.test(s)) return "sports"
  // Politicians / political figures
  if (/CONGRESS|SENATOR|PRESIDENT|GOVERNOR|POLITIC|HOUSE REP|CABINET|STATE OF THE UNION|SOTU|TRUMP|BIDEN|WHITE HOUSE/.test(t) || /POLITIC/.test(s)) return "politicians"
  // Earnings / financial mentions
  if (/EARNING|REVENUE|QUARTERLY|FISCAL|IPO|STOCK|SHARE|MARKET CAP|VALUATION|GUIDANCE/.test(t) || /EARNING/.test(s)) return "earnings"
  // Entertainment
  if (/MOVIE|FILM|ALBUM|SONG|GRAMMY|OSCAR|EMMY|BILLBOARD|STREAM|CONCERT|CELEB|ENTERTAIN|TV SHOW|SERIES|NETFLIX|SPOTIFY/.test(t) || /ENTERTAIN/.test(s)) return "entertainment"
  return "all"
}

/**
 * Returns true if an event looks like a real "mentions" market
 * (e.g. "Announcers at X vs Y", "What will X say during…").
 * Kalshi's API returns a very broad set under category=Mentions;
 * this filter narrows it to match what their actual Mentions page shows.
 */
export function isMentionsEvent(event: KalshiEvent): boolean {
  const t = (event.title ?? "").toLowerCase()
  // Announcer word-tracking markets
  if (t.startsWith("announcers at")) return true
  // "What will X say" markets
  if (/what will .+ say/.test(t)) return true
  // "Will X mention" / "mentions" markets
  if (/\bmention/.test(t)) return true
  // "What will be said" markets
  if (/what will .+ be said/.test(t)) return true
  // Series tickers that explicitly contain MENTION
  const s = (event.series_ticker ?? "").toUpperCase()
  if (s.includes("MENTION")) return true
  return false
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
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error(`Kalshi API error: ${res.status}`)
  return res.json() as Promise<KalshiMarketsResponse>
}

export async function fetchKalshiEvents(params: {
  status?: string
  limit?: number
  cursor?: string
  category?: string
  series_ticker?: string
  with_nested_markets?: boolean
  min_close_ts?: number
}): Promise<KalshiEventsResponse> {
  const searchParams = new URLSearchParams()
  if (params.status) searchParams.set("status", params.status)
  if (params.limit != null) searchParams.set("limit", String(params.limit))
  if (params.cursor) searchParams.set("cursor", params.cursor)
  if (params.category) searchParams.set("category", params.category)
  if (params.series_ticker) searchParams.set("series_ticker", params.series_ticker)
  if (params.with_nested_markets) searchParams.set("with_nested_markets", "true")
  if (params.series_ticker) searchParams.set("series_ticker", params.series_ticker)
  if (params.min_close_ts != null) searchParams.set("min_close_ts", String(params.min_close_ts))

  const url = `${KALSHI_API}/events?${searchParams.toString()}`
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { cache: "no-store" })
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
      continue
    }
    if (!res.ok) throw new Error(`Kalshi API error: ${res.status}`)
    return res.json() as Promise<KalshiEventsResponse>
  }
  throw new Error("Kalshi API error: 429 (rate limited after retries)")
}

/** Fetch markets for a given Kalshi category (e.g. Financials) by loading events and flattening nested markets. Paginates until we have enough or run out. */
export async function fetchKalshiMarketsByCategory(params: {
  category: string
  status?: string
  limit?: number
  minMarkets?: number
  /** Optional filter applied per-event before collecting markets. */
  eventFilter?: (event: KalshiEvent) => boolean
}): Promise<{ markets: KalshiMarket[] }> {
  const pageLimit = 50
  const minMarkets = params.minMarkets ?? 24
  // Allow more pages when filtering (most results get discarded)
  const maxPages = params.eventFilter ? 8 : 3
  const markets: KalshiMarket[] = []
  let cursor: string | undefined

  for (let page = 0; page < maxPages; page++) {
    // Add small delay to avoid 429 rate limits when aggressively paging
    if (page > 0) await new Promise((resolve) => setTimeout(resolve, 150))

    const data = await fetchKalshiEvents({
      status: params.status ?? "open",
      limit: pageLimit,
      cursor,
      category: params.category,
      with_nested_markets: true,
    })

    for (const event of data.events ?? []) {
      if (params.eventFilter && !params.eventFilter(event)) continue
      for (const m of event.markets ?? []) {
        if (m.status !== "active") continue
        markets.push({
          ...m,
          series_ticker: event.series_ticker,
        } as KalshiMarket)
      }
    }

    if (markets.length >= minMarkets || !data.cursor) break
    cursor = data.cursor
  }

  return { markets }
}

/**
 * Known series-ticker prefixes for real Kalshi "mentions" markets.
 * These correspond to announcer word-tracking, "what will X say", etc.
 * Update this list as Kalshi adds new mention series.
 */
const MENTION_SERIES_PREFIXES = [
  "KXNBAMENTION",
  "KXNCAABMENTION",
  "KXNFLMENTION",
  "KXNFLDPMENTION",
  "KXNHLDPMENTION",
  "KXMLBMENTION",
  "KXMMAMENTION",
  "KXEPLMENTION",
  "KXSNLMENTION",
  "KXOSCARMENTION",
  "KXPOWELLMENTION",
  "KXLEAVITTMENTION",
  "KXTRUMPMENTION",
  "KXEARNINGSCALLMENTION",
  "KXPRESSMENTION",
]

/** A mentions event with its nested word markets, ready for the frontend. */
export type MentionsEvent = {
  event_ticker: string
  series_ticker: string
  title: string
  markets: KalshiMarket[]
  /** Sum of volume across all nested markets */
  total_volume: number
  /** Earliest close time across nested markets */
  close_time: string
}

/** Fetch real mentions markets by querying known series-ticker prefixes in parallel. */
export async function fetchMentionsMarkets(params: {
  status?: string
}): Promise<{ events: MentionsEvent[] }> {
  const results = await Promise.allSettled(
    MENTION_SERIES_PREFIXES.map((prefix) =>
      fetchKalshiEvents({
        status: params.status ?? "open",
        limit: 50,
        series_ticker: prefix,
        with_nested_markets: true,
      })
    )
  )

  const events: MentionsEvent[] = []
  for (const result of results) {
    if (result.status !== "fulfilled") continue
    for (const event of result.value.events ?? []) {
      const activeMarkets = (event.markets ?? []).filter((m) => m.status === "active")
      if (activeMarkets.length === 0) continue
      const totalVol = activeMarkets.reduce((sum, m) => sum + (parseFloat(m.volume_fp ?? "0") || 0), 0)
      const closeTimes = activeMarkets.map((m) => m.close_time).filter(Boolean).sort()
      events.push({
        event_ticker: event.event_ticker,
        series_ticker: event.series_ticker,
        title: event.title,
        markets: activeMarkets,
        total_volume: totalVol,
        close_time: closeTimes[0] ?? "",
      })
    }
  }

  // Sort by total volume descending
  events.sort((a, b) => b.total_volume - a.total_volume)
  return { events }
}

export async function fetchKalshiSeries(params: {
  category?: string
  limit?: number
  cursor?: string
  tags?: string
}): Promise<KalshiSeriesResponse> {
  const searchParams = new URLSearchParams()
  if (params.category) searchParams.set("category", params.category)
  if (params.limit != null) searchParams.set("limit", String(params.limit))
  if (params.cursor) searchParams.set("cursor", params.cursor)
  if (params.tags) searchParams.set("tags", params.tags)

  const url = `${KALSHI_API}/series?${searchParams.toString()}`
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Kalshi API error: ${res.status}`)
  return res.json() as Promise<KalshiSeriesResponse>
}

/** Process items sequentially with retry and throttling to respect API rate limits. */
export async function throttledMap<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  batchSize: number
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = []
  const failed: { index: number; item: T }[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    for (let j = 0; j < batch.length; j++) {
      try {
        const value = await fn(batch[j])
        results.push({ status: "fulfilled", value })
      } catch (reason) {
        failed.push({ index: results.length, item: batch[j] })
        results.push({ status: "rejected", reason })
      }
    }
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, 250))
    }
  }

  // Retry failed items after a cooldown
  if (failed.length > 0) {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    for (const { index, item } of failed) {
      try {
        const value = await fn(item)
        results[index] = { status: "fulfilled", value }
      } catch {
        // Keep the original rejection
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  return results
}

export async function fetchKalshiMarketsByEvent(params: {
  event_ticker: string
  status?: string
  limit?: number
}): Promise<KalshiMarketsResponse> {
  const searchParams = new URLSearchParams()
  searchParams.set("event_ticker", params.event_ticker)
  if (params.status) searchParams.set("status", params.status)
  if (params.limit != null) searchParams.set("limit", String(params.limit))

  const url = `${KALSHI_API}/markets?${searchParams.toString()}`
  const res = await fetch(url, { next: { revalidate: 30 } })
  if (!res.ok) throw new Error(`Kalshi API error: ${res.status}`)
  return res.json() as Promise<KalshiMarketsResponse>
}

export async function fetchKalshiOrderbook(ticker: string): Promise<KalshiOrderbook> {
  const url = `${KALSHI_API}/markets/${ticker}/orderbook`
  const res = await fetch(url, { next: { revalidate: 10 } })
  if (!res.ok) throw new Error(`Kalshi API error: ${res.status}`)
  const data = await res.json()
  const ob = data.orderbook_fp ?? data.orderbook
  return { yes: ob?.yes_dollars ?? [], no: ob?.no_dollars ?? [] } as KalshiOrderbook
}

export async function fetchKalshiCandlesticks(
  ticker: string,
  seriesTicker: string,
  params: { period_interval?: number; start_ts?: number; end_ts?: number } = {}
): Promise<KalshiCandlestick[]> {
  const searchParams = new URLSearchParams()
  const interval = params.period_interval ?? 60
  searchParams.set("period_interval", String(interval))
  // Default to last 24 hours if not specified
  const now = Math.floor(Date.now() / 1000)
  searchParams.set("start_ts", String(params.start_ts ?? now - 86400))
  searchParams.set("end_ts", String(params.end_ts ?? now))
  const url = `${KALSHI_API}/series/${seriesTicker}/markets/${ticker}/candlesticks?${searchParams}`
  const res = await fetch(url, { next: { revalidate: 30 } })
  if (!res.ok) throw new Error(`Kalshi API error: ${res.status}`)
  const data = await res.json()
  return data.candlesticks as KalshiCandlestick[]
}

export async function fetchKalshiTrades(
  ticker: string,
  params: { limit?: number; cursor?: string } = {}
): Promise<{ trades: KalshiTrade[]; cursor: string }> {
  const searchParams = new URLSearchParams()
  searchParams.set("ticker", ticker)
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.cursor) searchParams.set("cursor", params.cursor)
  const url = `${KALSHI_API}/markets/trades?${searchParams}`
  const res = await fetch(url, { next: { revalidate: 15 } })
  if (!res.ok) throw new Error(`Kalshi API error: ${res.status}`)
  return res.json()
}
