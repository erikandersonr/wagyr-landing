"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, notFound } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  KALSHI_CATEGORIES,
  KALSHI_SUBCATEGORIES,
} from "@/lib/kalshi"
import type { KalshiCategoryId } from "@/lib/kalshi"
import type { KalshiMarket, MentionsEvent } from "@/lib/kalshi"
import { yesPercent, noPercent, volume, volume24h, getFinancialsSubcategoryId, getMentionsSubcategoryId } from "@/lib/kalshi"
import { CircleNotch } from "@phosphor-icons/react"

type SortTab = "trending" | "new" | "closing-soon"

/** Categories that fetch live Kalshi data instead of showing mocks. */
const LIVE_CATEGORIES = new Set(["financials", "mentions"])

/** Subcategory mapper per live category. */
const SUBCATEGORY_MAPPER: Record<string, (m: KalshiMarket) => string> = {
  financials: getFinancialsSubcategoryId,
  mentions: getMentionsSubcategoryId,
}

const WAGYR_GREEN = "#00d4aa"
const WAGYR_CARD = "#1e2337"
const WAGYR_BORDER = "rgba(255,255,255,0.08)"
const WAGYR_MUTED = "rgba(255,255,255,0.5)"

function formatVol(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
  return `$${Math.round(v)}`
}

function formatClose(closeTime: string | undefined): string {
  if (!closeTime) return "—"
  try {
    const d = new Date(closeTime)
    if (Number.isNaN(d.getTime())) return "—"
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  } catch {
    return "—"
  }
}

/** Mock markets for non-wired categories — placeholder data */
function getMockMarkets(category: string, subcategory: string) {
  const titles: Record<string, string[]> = {
    politics: [
      "Will a new federal agency be created by end of 2026?",
      "Will the Senate confirm all cabinet nominees by April?",
      "Will the US impose new sanctions on Russia in Q2?",
      "Will voter turnout exceed 2024 in the next midterm?",
      "Will a Supreme Court justice retire this term?",
      "Will the debt ceiling be raised before the deadline?",
    ],
    sports: [
      "Will the Lakers make the NBA playoffs?",
      "Will a no-hitter be thrown in the MLB this week?",
      "Will the Super Bowl champion repeat?",
      "Will the MLS season average attendance increase?",
      "Will a 40-point game be scored tonight in the NBA?",
      "Will the #1 seed win the NCAA tournament?",
    ],
    culture: [
      "Will the #1 Billboard hit stay on top for 10+ weeks?",
      "Will the top streaming movie exceed 100M views?",
      "Will an animated film win Best Picture at the Oscars?",
      "Will a new album break first-week streaming records?",
      "Will the Grammys viewership exceed last year?",
      "Will a video game adaptation get above 90% on RT?",
    ],
    crypto: [
      "Will BTC close above $100,000 this month?",
      "Will ETH outperform BTC over the next 7 days?",
      "Will SOL reach a new all-time high this quarter?",
      "Will DOGE market cap exceed $30B this week?",
      "Will BTC dominance stay above 55%?",
      "Will a new crypto ETF be approved this quarter?",
    ],
    climate: [
      "Will NYC temperature exceed 80°F this week?",
      "Will a Category 4+ hurricane form in the Atlantic?",
      "Will global CO2 levels set a new monthly record?",
      "Will snowfall in Denver exceed seasonal average?",
      "Will a wildfire burn more than 50,000 acres this month?",
      "Will rainfall in LA exceed 2 inches this week?",
    ],
    economics: [
      "Will the Fed cut rates at the next meeting?",
      "Will CPI come in below 3% this month?",
      "Will unemployment rise above 4.5%?",
      "Will GDP growth exceed 2.5% this quarter?",
      "Will oil prices stay above $80/barrel?",
      "Will housing starts increase month-over-month?",
    ],
    mentions: [
      "Will Elon Musk be mentioned 500+ times on CNBC today?",
      "Will Taylor Swift trend on Twitter this week?",
      "Will 'recession' mentions on cable news spike above 1000?",
      "Will the President hold a press conference this week?",
      "Will 'AI' be mentioned more than 'crypto' on Bloomberg?",
      "Will a CEO resignation make front-page news?",
    ],
    companies: [
      "Will Apple announce a new product this quarter?",
      "Will Tesla deliveries exceed analyst estimates?",
      "Will a major tech IPO price above its range?",
      "Will NVIDIA earnings beat revenue expectations?",
      "Will a Fortune 500 CEO step down this month?",
      "Will a major tech company announce layoffs?",
    ],
    financials: [
      "Will the S&P 500 close at a new all-time high?",
      "Will the Nasdaq rise more than 2% this week?",
      "Will the 10-year Treasury yield stay below 4.5%?",
      "Will gold prices reach $2,500/oz?",
      "Will WTI crude close above $85 this week?",
      "Will EUR/USD trade above 1.10 this month?",
    ],
    "tech-science": [
      "Will a new AI model beat GPT-4 on benchmarks?",
      "Will SpaceX successfully land Starship this month?",
      "Will a fusion energy milestone be announced?",
      "Will a new exoplanet be confirmed this quarter?",
      "Will quantum computing achieve a new qubit record?",
      "Will a major solar farm come online this quarter?",
    ],
  }

  return (titles[category] ?? titles.politics).map((title, i) => ({
    id: `${category}-${subcategory}-${i}`,
    title,
    yesPercent: Math.floor(Math.random() * 60) + 20,
    volume: `$${(Math.random() * 5 + 0.1).toFixed(1)}M`,
    closeDate: "Apr 15, 2026",
    subcategory,
  }))
}

const COLLAPSED_COUNT = 4

function MentionsEventCard({ evt }: { evt: MentionsEvent }) {
  const [expanded, setExpanded] = useState(false)
  const extraRef = useRef<HTMLDivElement>(null)
  const [extraHeight, setExtraHeight] = useState(0)

  // Measure the hidden content height for smooth animation
  useEffect(() => {
    if (extraRef.current) {
      setExtraHeight(extraRef.current.scrollHeight)
    }
  }, [evt.markets])

  const visibleMarkets = evt.markets.slice(0, COLLAPSED_COUNT)
  const hiddenMarkets = evt.markets.slice(COLLAPSED_COUNT)
  const hasMore = hiddenMarkets.length > 0

  return (
    <Card
      className="border-0 transition-all duration-300 ease-in-out"
      style={{
        background: WAGYR_CARD,
        boxShadow: expanded ? "0 0 0 1px rgba(0,212,170,0.25), 0 8px 24px rgba(0,0,0,0.3)" : "none",
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onClick={() => setExpanded((v) => !v)}
    >
      <CardHeader className="pb-2">
        <CardDescription className="text-xs" style={{ color: WAGYR_MUTED }}>
          Mentions · Closes {formatClose(evt.close_time)}
        </CardDescription>
        <CardTitle className="text-sm font-medium text-white">
          {evt.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Always-visible markets */}
        <div className="space-y-1.5">
          {visibleMarkets.map((m) => (
            <MarketRow key={m.ticker} m={m} expanded={expanded} />
          ))}
        </div>

        {/* Expandable section */}
        {hasMore && (
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxHeight: expanded ? extraHeight : 0, opacity: expanded ? 1 : 0 }}
          >
            <div ref={extraRef} className="space-y-1.5 pt-1.5">
              {hiddenMarkets.map((m) => (
                <MarketRow key={m.ticker} m={m} expanded={expanded} />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between border-t pt-2 mt-3"
          style={{ borderColor: WAGYR_BORDER }}
        >
          <span className="text-xs" style={{ color: WAGYR_MUTED }}>
            {formatVol(evt.total_volume)} vol
          </span>
          <span className="text-xs" style={{ color: WAGYR_MUTED }}>
            {hasMore && !expanded
              ? `+${hiddenMarkets.length} more · `
              : ""}
            {evt.markets.length} markets
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function MarketRow({ m, expanded }: { m: KalshiMarket; expanded: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span
        className="text-xs text-white/80 truncate"
        style={{ maxWidth: expanded ? "45%" : "60%" }}
      >
        {m.yes_sub_title || m.subtitle || m.title}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ background: "rgba(0,212,170,0.2)", color: WAGYR_GREEN }}
        >
          {yesPercent(m)}%
        </span>
        {expanded && (
          <>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium text-white/70"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              {noPercent(m)}%
            </span>
            <span className="text-xs tabular-nums" style={{ color: WAGYR_MUTED, minWidth: "4rem", textAlign: "right" }}>
              {formatVol(volume(m))}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

export default function CategoryPage() {
  const params = useParams()
  const categoryId = params.category as string

  const category = KALSHI_CATEGORIES.find((c) => c.id === categoryId)
  if (!category || categoryId === "home") {
    notFound()
  }

  const subcategories = KALSHI_SUBCATEGORIES[categoryId as Exclude<KalshiCategoryId, "home">]
  const [activeSubcategory, setActiveSubcategory] = useState("all")
  const [activeTab, setActiveTab] = useState<SortTab>("trending")

  const isLiveCategory = LIVE_CATEGORIES.has(categoryId)
  const isMentions = categoryId === "mentions"
  const getSubcategoryId = SUBCATEGORY_MAPPER[categoryId] ?? (() => "all")
  const [kalshiMarkets, setKalshiMarkets] = useState<KalshiMarket[]>([])
  const [mentionsEvents, setMentionsEvents] = useState<MentionsEvent[]>([])
  const [loading, setLoading] = useState(isLiveCategory)
  const [error, setError] = useState<string | null>(null)

  const filteredMarkets =
    !isLiveCategory || activeSubcategory === "all"
      ? kalshiMarkets
      : kalshiMarkets.filter((m) => getSubcategoryId(m) === activeSubcategory)

  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    if (activeTab === "trending") return volume24h(b) - volume24h(a) || volume(b) - volume(a)
    if (activeTab === "new") {
      const tA = a.open_time ? new Date(a.open_time).getTime() : 0
      const tB = b.open_time ? new Date(b.open_time).getTime() : 0
      return tB - tA
    }
    if (activeTab === "closing-soon") {
      const tA = new Date(a.close_time).getTime()
      const tB = new Date(b.close_time).getTime()
      return tA - tB
    }
    return 0
  })

  useEffect(() => {
    if (!isLiveCategory) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/kalshi/markets?category=${categoryId}&limit=50`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        if (isMentions && data.events) {
          setMentionsEvents(data.events ?? [])
        } else {
          setKalshiMarkets(data.markets ?? [])
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load markets")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isLiveCategory, isMentions, categoryId])

  const mockMarkets = getMockMarkets(categoryId, activeSubcategory)

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{category.label}</h1>
        <p className="mt-2 text-sm" style={{ color: WAGYR_MUTED }}>
          {isLiveCategory
            ? categoryId === "financials"
              ? "Live Kalshi financials markets — S&P, Nasdaq, Treasuries, FX, and more. Use these for your league slate."
              : `Live Kalshi ${category.label.toLowerCase()} markets — will a person, topic, or brand get mentioned? Use these for your league slate.`
            : `Browse ${category.label.toLowerCase()} prediction markets. Pick a subcategory to focus your league.`}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <aside>
          <nav className="space-y-0.5">
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubcategory(sub.id)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeSubcategory === sub.id
                    ? "font-medium"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
                style={
                  activeSubcategory === sub.id
                    ? { color: WAGYR_GREEN }
                    : undefined
                }
              >
                {sub.label}
              </button>
            ))}
          </nav>
        </aside>

        <div>
          <div className="mb-4 flex items-center gap-2">
            {(["trending", "new", "closing-soon"] as const).map((tab) => {
              const isActive = isLiveCategory ? activeTab === tab : tab === "trending"
              return (
              <Button
                key={tab}
                variant="ghost"
                size="sm"
                onClick={() => isLiveCategory && setActiveTab(tab)}
                className={
                  isActive
                    ? "text-[#171b2c]"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }
                style={isActive ? { background: WAGYR_GREEN } : undefined}
              >
                {tab === "trending"
                  ? "Trending"
                  : tab === "new"
                    ? "New"
                    : "Closing soon"}
              </Button>
              )
            })}
          </div>

          {isLiveCategory && error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {isLiveCategory && loading && (
            <div className="flex items-center justify-center py-16">
              <CircleNotch className="size-8 animate-spin" style={{ color: WAGYR_GREEN }} weight="bold" />
            </div>
          )}

          {isLiveCategory && !loading && isMentions && (
            <div className="grid gap-4 sm:grid-cols-2">
              {mentionsEvents.length === 0 ? (
                <p className="col-span-full py-8 text-center text-white/60">
                  No open mentions markets right now. Check back later.
                </p>
              ) : (
                mentionsEvents.map((evt) => (
                  <MentionsEventCard key={evt.event_ticker} evt={evt} />
                ))
              )}
            </div>
          )}

          {isLiveCategory && !loading && !isMentions && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sortedMarkets.length === 0 ? (
                <p className="col-span-full py-8 text-center text-white/60">
                  {kalshiMarkets.length === 0
                    ? `No open ${category.label.toLowerCase()} markets right now. Check back later.`
                    : `No markets in ${subcategories.find((s) => s.id === activeSubcategory)?.label ?? activeSubcategory}. Try another filter.`}
                </p>
              ) : (
                sortedMarkets.map((m) => (
                  <Card
                    key={m.ticker}
                    className="cursor-pointer border-0 transition-colors hover:opacity-95"
                    style={{ background: WAGYR_CARD }}
                  >
                    <CardHeader className="pb-2">
                      <CardDescription
                        className="text-xs"
                        style={{ color: WAGYR_MUTED }}
                      >
                        {category.label} · Closes {formatClose(m.close_time)}
                      </CardDescription>
                      <CardTitle className="text-sm font-medium text-white line-clamp-2">
                        {m.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex gap-2">
                          <span
                            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{
                              background: "rgba(0,212,170,0.2)",
                              color: WAGYR_GREEN,
                            }}
                          >
                            YES {yesPercent(m)}%
                          </span>
                          <span
                            className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white/70"
                            style={{ background: "rgba(255,255,255,0.1)" }}
                          >
                            NO {noPercent(m)}%
                          </span>
                        </div>
                        <span className="text-xs" style={{ color: WAGYR_MUTED }}>
                          {formatVol(volume(m))} vol
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {!isLiveCategory && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {mockMarkets.map((m) => (
                <Card
                  key={m.id}
                  className="cursor-pointer border-0 transition-colors hover:opacity-95"
                  style={{ background: WAGYR_CARD }}
                >
                  <CardHeader className="pb-2">
                    <CardDescription
                      className="text-xs"
                      style={{ color: WAGYR_MUTED }}
                    >
                      {category.label} · Closes {m.closeDate}
                    </CardDescription>
                    <CardTitle className="text-sm font-medium text-white line-clamp-2">
                      {m.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            background: "rgba(0,212,170,0.2)",
                            color: WAGYR_GREEN,
                          }}
                        >
                          YES {m.yesPercent}%
                        </span>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white/70"
                          style={{ background: "rgba(255,255,255,0.1)" }}
                        >
                          NO {100 - m.yesPercent}%
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: WAGYR_MUTED }}>
                        {m.volume} vol
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
