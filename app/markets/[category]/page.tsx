"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EventDetailDialog } from "@/components/event-detail-dialog"
import {
  KALSHI_CATEGORIES,
  KALSHI_SUBCATEGORIES,
  yesPercent,
  volume,
  formatVol,
} from "@/lib/kalshi"
import type { KalshiCategoryId, KalshiEvent } from "@/lib/kalshi"

const WAGYR_GREEN = "#00d4aa"
const WAGYR_CARD = "#1e2337"
const WAGYR_BORDER = "rgba(255,255,255,0.08)"
const WAGYR_MUTED = "rgba(255,255,255,0.5)"

export default function CategoryPage() {
  const params = useParams()
  const categoryId = params.category as string

  const category = KALSHI_CATEGORIES.find((c) => c.id === categoryId)
  if (!category || categoryId === "home") {
    notFound()
  }

  const subcategories = KALSHI_SUBCATEGORIES[categoryId as Exclude<KalshiCategoryId, "home">]
  const [activeSubcategory, setActiveSubcategory] = useState("all")
  const [events, setEvents] = useState<KalshiEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isLive = categoryId === "crypto"

  useEffect(() => {
    if (!isLive) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      category: categoryId,
      status: "open",
      limit: "50",
    })
    if (activeSubcategory !== "all") {
      params.set("subcategory", activeSubcategory)
    }

    fetch(`/api/kalshi/events?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then((data: { events: KalshiEvent[] }) => {
        if (!cancelled) setEvents(data.events ?? [])
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [categoryId, activeSubcategory, isLive])

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
                <div
                  key="separator"
                  className="my-2 border-t"
                  style={{ borderColor: WAGYR_BORDER }}
                />
              ) : (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubcategory(sub.id)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activeSubcategory === sub.id
                      ? "font-medium"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
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
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {!isLive && (
            <div className="flex h-48 items-center justify-center rounded-lg" style={{ background: WAGYR_CARD }}>
              <p className="text-sm" style={{ color: WAGYR_MUTED }}>
                {category.label} markets coming soon.
              </p>
            </div>
          )}

          {isLive && loading && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Card key={i} className="border-0" style={{ background: WAGYR_CARD }}>
                  <CardHeader className="pb-2">
                    <div className="h-3 w-20 rounded bg-white/10" />
                    <div className="mt-2 h-5 w-full rounded bg-white/10" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="h-5 w-16 rounded bg-white/10" />
                        <div className="h-5 w-16 rounded bg-white/10" />
                      </div>
                      <div className="h-4 w-32 rounded bg-white/10" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {isLive && !loading && events.length === 0 && !error && (
            <div className="flex h-48 items-center justify-center rounded-lg" style={{ background: WAGYR_CARD }}>
              <p className="text-sm" style={{ color: WAGYR_MUTED }}>
                No open events found for this subcategory.
              </p>
            </div>
          )}

          {isLive && !loading && events.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {events.map((e) => {
                const markets = e.markets ?? []
                const sorted = [...markets].sort((a, b) => yesPercent(b) - yesPercent(a))
                const totalVol = markets.reduce((sum, m) => sum + volume(m), 0)

                return (
                  <EventDetailDialog key={e.event_ticker} event={e} trigger={
                    <Card
                      className="cursor-pointer border-0 transition-colors hover:opacity-95"
                      style={{ background: WAGYR_CARD }}
                    >
                      <CardHeader className="pb-3">
                        <CardDescription className="flex items-center justify-between text-xs" style={{ color: WAGYR_MUTED }}>
                          <span>{category.label}</span>
                          <span>{formatVol(totalVol)}</span>
                        </CardDescription>
                        <CardTitle className="mt-1 text-sm font-medium text-white line-clamp-2">
                          {e.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-0">
                        {sorted.slice(0, 2).map((m) => (
                          <div key={m.ticker} className="flex items-center justify-between gap-2">
                            <span className="min-w-0 truncate text-xs text-white/80">
                              {m.yes_sub_title || m.title}
                            </span>
                            <span
                              className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                              style={{ background: "rgba(0,212,170,0.15)", color: WAGYR_GREEN }}
                            >
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
        </div>
      </div>
    </main>
  )
}
