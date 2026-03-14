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
import { CircleNotch } from "@phosphor-icons/react"
import { EventDetailDialog } from "@/components/event-detail-dialog"
import {
  KALSHI_CATEGORIES,
  KALSHI_SUBCATEGORIES,
  yesPercent,
  noPercent,
  volume,
  volume24h,
  formatVol,
  getFinancialsSubcategoryId,
  getMentionsSubcategoryId,
} from "@/lib/kalshi"
import type { KalshiCategoryId, KalshiEvent, KalshiMarket, MentionsEvent } from "@/lib/kalshi"

const WAGYR_GREEN = "#00d4aa"
const WAGYR_CARD = "#1e2337"
const WAGYR_BORDER = "rgba(255,255,255,0.08)"
const WAGYR_MUTED = "rgba(255,255,255,0.5)"

type SortTab = "trending" | "new" | "closing-soon"

const SUBCATEGORY_MAPPER: Record<string, (m: KalshiMarket) => string> = {
  financials: getFinancialsSubcategoryId,
  mentions: getMentionsSubcategoryId,
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

const COLLAPSED_COUNT = 4

function MentionsEventCard({ evt }: { evt: MentionsEvent }) {
  const [expanded, setExpanded] = useState(false)
  const extraRef = useRef<HTMLDivElement>(null)
  const [extraHeight, setExtraHeight] = useState(0)

  useEffect(() => {
    if (extraRef.current) setExtraHeight(extraRef.current.scrollHeight)
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
        <CardTitle className="text-sm font-medium text-white">{evt.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1.5">
          {visibleMarkets.map((m) => (
            <MarketRow key={m.ticker} m={m} expanded={expanded} />
          ))}
        </div>
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
        <div className="flex items-center justify-between border-t pt-2 mt-3" style={{ borderColor: WAGYR_BORDER }}>
          <span className="text-xs" style={{ color: WAGYR_MUTED }}>{formatVol(evt.total_volume)} vol</span>
          <span className="text-xs" style={{ color: WAGYR_MUTED }}>
            {hasMore && !expanded ? `+${hiddenMarkets.length} more · ` : ""}{evt.markets.length} markets
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function MarketRow({ m, expanded }: { m: KalshiMarket; expanded: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-white/80 truncate" style={{ maxWidth: expanded ? "45%" : "60%" }}>
        {m.yes_sub_title || m.subtitle || m.title}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "rgba(0,212,170,0.2)", color: WAGYR_GREEN }}>
          {yesPercent(m)}%
        </span>
        {expanded && (
          <>
            <span className="rounded-full px-2 py-0.5 text-xs font-medium text-white/70" style={{ background: "rgba(255,255,255,0.1)" }}>
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

  // Categories with live Kalshi data via events route
  const usesEventsRoute = categoryId === "crypto" || categoryId === "politics"
  // Financials and mentions use teammates' markets route approach
  const isFinancialsOrMentions = categoryId === "financials" || categoryId === "mentions"
  const isMentions = categoryId === "mentions"
  const isLive = usesEventsRoute || isFinancialsOrMentions
  const getSubcategoryId = SUBCATEGORY_MAPPER[categoryId] ?? (() => "all")

  // Crypto state
  const [events, setEvents] = useState<KalshiEvent[]>([])

  // Financials/mentions state
  const [kalshiMarkets, setKalshiMarkets] = useState<KalshiMarket[]>([])
  const [mentionsEvents, setMentionsEvents] = useState<MentionsEvent[]>([])

  const [loading, setLoading] = useState(isLive)
  const [error, setError] = useState<string | null>(null)

  // Crypto fetch
  useEffect(() => {
    if (!usesEventsRoute) return
    let cancelled = false
    setLoading(true)
    setError(null)

    const p = new URLSearchParams({ category: categoryId, status: "open", limit: "50" })
    if (activeSubcategory !== "all") p.set("subcategory", activeSubcategory)

    fetch(`/api/kalshi/events?${p}`)
      .then((res) => { if (!res.ok) throw new Error(res.statusText); return res.json() })
      .then((data: { events: KalshiEvent[] }) => { if (!cancelled) setEvents(data.events ?? []) })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [usesEventsRoute, categoryId, activeSubcategory])

  // Financials/mentions fetch
  useEffect(() => {
    if (!isFinancialsOrMentions) return
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`/api/kalshi/markets?category=${categoryId}&limit=50`)
      .then((res) => { if (!res.ok) throw new Error(res.statusText); return res.json() })
      .then((data) => {
        if (cancelled) return
        if (isMentions && data.events) setMentionsEvents(data.events ?? [])
        else setKalshiMarkets(data.markets ?? [])
      })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [isFinancialsOrMentions, isMentions, categoryId])

  // Financials filtering and sorting
  const filteredMarkets = activeSubcategory === "all"
    ? kalshiMarkets
    : kalshiMarkets.filter((m) => getSubcategoryId(m) === activeSubcategory)

  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    if (activeTab === "trending") return volume24h(b) - volume24h(a) || volume(b) - volume(a)
    if (activeTab === "new") return (new Date(b.open_time ?? 0).getTime()) - (new Date(a.open_time ?? 0).getTime())
    if (activeTab === "closing-soon") return new Date(a.close_time).getTime() - new Date(b.close_time).getTime()
    return 0
  })

  const sortedMentionsEvents = [...mentionsEvents].sort((a, b) => {
    if (activeTab === "trending") return b.total_volume - a.total_volume
    if (activeTab === "new") return new Date(b.close_time).getTime() - new Date(a.close_time).getTime()
    if (activeTab === "closing-soon") return new Date(a.close_time).getTime() - new Date(b.close_time).getTime()
    return 0
  })

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{category.label}</h1>
        <p className="mt-2 text-sm" style={{ color: WAGYR_MUTED }}>
          Browse {category.label.toLowerCase()} prediction markets. Pick a subcategory to focus your league.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <aside>
          <nav className="space-y-0.5">
            {subcategories.map((sub) =>
              sub.id === "---" ? (
                <div key="separator" className="my-2 border-t" style={{ borderColor: WAGYR_BORDER }} />
              ) : (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubcategory(sub.id)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activeSubcategory === sub.id ? "font-medium" : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                  style={activeSubcategory === sub.id ? { color: WAGYR_GREEN } : undefined}
                >
                  {sub.label}
                </button>
              )
            )}
          </nav>
        </aside>

        <div>
          {/* Sort tabs for financials/mentions */}
          {isFinancialsOrMentions && (
            <div className="mb-4 flex items-center gap-2">
              {(["trending", "new", "closing-soon"] as const).map((tab) => (
                <Button
                  key={tab}
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className={activeTab === tab ? "text-[#171b2c]" : "text-white/70 hover:bg-white/10 hover:text-white"}
                  style={activeTab === tab ? { background: WAGYR_GREEN } : undefined}
                >
                  {tab === "trending" ? "Trending" : tab === "new" ? "New" : "Closing soon"}
                </Button>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {!isLive && (
            <div className="flex h-48 items-center justify-center rounded-lg" style={{ background: WAGYR_CARD }}>
              <p className="text-sm" style={{ color: WAGYR_MUTED }}>{category.label} markets coming soon.</p>
            </div>
          )}

          {isLive && loading && (
            <div className="flex items-center justify-center py-16">
              <CircleNotch className="size-8 animate-spin" style={{ color: WAGYR_GREEN }} weight="bold" />
            </div>
          )}

          {/* ===== CRYPTO: Oddpool-style cards ===== */}
          {usesEventsRoute && !loading && events.length === 0 && !error && (
            <div className="flex h-48 items-center justify-center rounded-lg" style={{ background: WAGYR_CARD }}>
              <p className="text-sm" style={{ color: WAGYR_MUTED }}>No open events found for this subcategory.</p>
            </div>
          )}

          {usesEventsRoute && !loading && events.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {events.map((e) => {
                const markets = e.markets ?? []
                const sorted = [...markets].sort((a, b) => yesPercent(b) - yesPercent(a))
                const totalVol = markets.reduce((sum, m) => sum + volume(m), 0)
                return (
                  <EventDetailDialog key={e.event_ticker} event={e} trigger={
                    <Card className="cursor-pointer border-0 transition-colors hover:opacity-95" style={{ background: WAGYR_CARD }}>
                      <CardHeader className="pb-3">
                        <CardDescription className="flex items-center justify-between text-xs" style={{ color: WAGYR_MUTED }}>
                          <span>{category.label}</span>
                          <span>{formatVol(totalVol)}</span>
                        </CardDescription>
                        <CardTitle className="mt-1 text-sm font-medium text-white line-clamp-2">{e.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-0">
                        {sorted.slice(0, 2).map((m) => (
                          <div key={m.ticker} className="flex items-center justify-between gap-2">
                            <span className="min-w-0 truncate text-xs text-white/80">{m.yes_sub_title || m.title}</span>
                            <span className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "rgba(0,212,170,0.15)", color: WAGYR_GREEN }}>
                              {yesPercent(m)}%
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center justify-end pt-1">
                          <span className="text-[11px]" style={{ color: WAGYR_MUTED }}>
                            {markets.length} market{markets.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  } />
                )
              })}
            </div>
          )}

          {/* ===== MENTIONS: Expandable event cards ===== */}
          {isMentions && !loading && (
            <div className="grid gap-4 sm:grid-cols-2">
              {sortedMentionsEvents.length === 0 ? (
                <p className="col-span-full py-8 text-center text-white/60">No open mentions markets right now.</p>
              ) : sortedMentionsEvents.map((evt) => (
                <MentionsEventCard key={evt.event_ticker} evt={evt} />
              ))}
            </div>
          )}

          {/* ===== FINANCIALS: Standard market cards ===== */}
          {categoryId === "financials" && !loading && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sortedMarkets.length === 0 ? (
                <p className="col-span-full py-8 text-center text-white/60">No open financials markets right now.</p>
              ) : sortedMarkets.map((m) => (
                <Card key={m.ticker} className="cursor-pointer border-0 transition-colors hover:opacity-95" style={{ background: WAGYR_CARD }}>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs" style={{ color: WAGYR_MUTED }}>
                      {category.label} · Closes {formatClose(m.close_time)}
                    </CardDescription>
                    <CardTitle className="text-sm font-medium text-white line-clamp-2">{m.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "rgba(0,212,170,0.2)", color: WAGYR_GREEN }}>
                          YES {yesPercent(m)}%
                        </span>
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white/70" style={{ background: "rgba(255,255,255,0.1)" }}>
                          NO {noPercent(m)}%
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: WAGYR_MUTED }}>{formatVol(volume(m))} vol</span>
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
