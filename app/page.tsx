"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  BookmarkSimple,
  TrendUp,
  CaretRight,
  ShareNetwork,
  CircleNotch,
  Trophy,
  UsersThree,
  CalendarBlank,
  ChartLineUp,
  Target,
  Lightning,
} from "@phosphor-icons/react"
import type { KalshiMarket } from "@/lib/kalshi"
import {
  yesPercent,
  noPercent,
  yesChangePercent,
  themeFromSeries,
  volume,
  volume24h,
  formatVol,
  formatClose,
} from "@/lib/kalshi"

const WAGYR_BG = "#171b2c"
const WAGYR_GREEN = "#00d4aa"
const WAGYR_CARD = "#1e2337"
const WAGYR_BORDER = "rgba(255,255,255,0.08)"
const WAGYR_MUTED = "rgba(255,255,255,0.5)"

const WEEKLY_THEMES = [
  { id: "fed", name: "Economics", desc: "Rates, inflation, and Fed decisions.", icon: ChartLineUp },
  { id: "politics", name: "Politics", desc: "Elections, tariffs, and global events.", icon: Target },
  { id: "financials", name: "Financials", desc: "Markets, earnings, and company events.", icon: TrendUp },
  { id: "sports", name: "Sports", desc: "NFL, NBA, MLB, and more.", icon: UsersThree },
] as const

/** Mock leaderboard for illustration */
const MOCK_LEADERBOARD = [
  { rank: 1, name: "Alex", points: 847, correct: 12, total: 15, conviction: "High" },
  { rank: 2, name: "Sam", points: 821, correct: 11, total: 15, conviction: "High" },
  { rank: 3, name: "Jordan", points: 798, correct: 12, total: 15, conviction: "Med" },
  { rank: 4, name: "Casey", points: 765, correct: 10, total: 15, conviction: "High" },
  { rank: 5, name: "You", points: "—", correct: "—", total: 15, conviction: "Join a league" },
]

export default function Page() {
  const [markets, setMarkets] = useState<KalshiMarket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch("/api/kalshi/markets?limit=24&status=open")
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then((data: { markets: KalshiMarket[] }) => {
        if (!cancelled) setMarkets(data.markets ?? [])
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const breaking = [...markets]
    .sort((a, b) => volume24h(b) - volume24h(a) || Math.abs(yesChangePercent(b)) - Math.abs(yesChangePercent(a)))
    .slice(0, 3)

  const featured = markets.length
    ? markets.reduce((best, m) => (volume(m) >= volume(best) ? m : best), markets[0])
    : null

  const gridMarkets = markets.slice(0, 12)
  const currentTheme = "Geopolitics"

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Hero — fantasy league */}
        <section className="mb-12 text-center md:mb-16 mt-12">
          <h1 className="text-3xl font-medium tracking-tight text-white md:text-4xl lg:text-5xl">
            The fantasy league for prediction markets
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            Join a league. Get a weekly slate of real Kalshi events. Call{" "}
            <strong className="text-white">YES</strong> or{" "}
            <strong className="text-white">NO</strong>. Earn points for
            accuracy and conviction. Climb the leaderboard against friends.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="font-semibold text-[#171b2c] hover:opacity-80"
              style={{ background: WAGYR_GREEN }}
            >
              Create or join a league
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/20 text-foreground hover:bg-white/70"
            >
              How scoring works
            </Button>
          </div>
        </section>

        {/* How the league works */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-semibold text-white">How the league works</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: UsersThree,
                title: "Join or create a league",
                text: "Invite friends or join a public league. Each league has its own leaderboard and weekly slate.",
              },
              {
                icon: CalendarBlank,
                title: "Weekly slate",
                text: "Every week we curate a set of Kalshi events around a theme — Fed policy, geopolitics, earnings, elections.",
              },
              {
                icon: Target,
                title: "Make your picks",
                text: "Call YES or NO on each event. Optionally set conviction (low / medium / high) for extra points when you’re right.",
              },
              {
                icon: Trophy,
                title: "Points & leaderboard",
                text: "Points for correct calls; more for conviction when right. Live leaderboard resets each week. Best record wins.",
              },
            ].map((step) => (
              <Card key={step.title} className="border-0" style={{ background: WAGYR_CARD }}>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "rgba(0,212,170,0.15)" }}>
                    <step.icon className="size-5" style={{ color: WAGYR_GREEN }} weight="bold" />
                  </div>
                  <CardTitle className="text-base text-white">{step.title}</CardTitle>
                  <CardDescription className="text-sm" style={{ color: WAGYR_MUTED }}>
                    {step.text}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Main content: Scoring + Leaderboard + Sidebar */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            {/* Scoring explainer */}
            <Card className="border-0" style={{ background: WAGYR_CARD }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Lightning className="size-5" style={{ color: WAGYR_GREEN }} weight="fill" />
                  How scoring works
                </CardTitle>
                <CardDescription className="text-sm" style={{ color: WAGYR_MUTED }}>
                  Points are awarded when events resolve. Higher conviction = more risk and more reward.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border px-4 py-3" style={{ borderColor: WAGYR_BORDER }}>
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: WAGYR_MUTED }}>
                      Accuracy
                    </p>
                    <p className="mt-1 text-sm text-white/90">
                      Correct YES or NO = base points. Wrong = 0 for that event.
                    </p>
                  </div>
                  <div className="rounded-lg border px-4 py-3" style={{ borderColor: WAGYR_BORDER }}>
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: WAGYR_MUTED }}>
                      Conviction
                    </p>
                    <p className="mt-1 text-sm text-white/90">
                      Mark a pick as high conviction to multiply points when you’re right. Wrong high-conviction picks cost more.
                    </p>
                  </div>
                </div>
                <p className="text-xs" style={{ color: WAGYR_MUTED }}>
                  Example: 10 events, 8 correct (2 high conviction). You earn base points × (1 + conviction bonus). Exact formula is shown in-app.
                </p>
              </CardContent>
            </Card>

            {/* Sample leaderboard */}
            <Card className="border-0" style={{ background: WAGYR_CARD }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Trophy className="size-5" style={{ color: WAGYR_GREEN }} weight="fill" />
                  League leaderboard (example)
                </CardTitle>
                <CardDescription className="text-sm" style={{ color: WAGYR_MUTED }}>
                  Live standings for your league. Resets every week with the new slate.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ color: WAGYR_MUTED }}>
                        <th className="pb-2 text-left font-medium">#</th>
                        <th className="pb-2 text-left font-medium">Player</th>
                        <th className="pb-2 text-right font-medium">Points</th>
                        <th className="pb-2 text-right font-medium">Correct</th>
                        <th className="pb-2 text-right font-medium">Conviction</th>
                      </tr>
                    </thead>
                    <tbody className="text-white/90">
                      {MOCK_LEADERBOARD.map((row) => (
                        <tr key={row.rank} className="border-t" style={{ borderColor: WAGYR_BORDER }}>
                          <td className="py-2.5 font-medium">{row.rank}</td>
                          <td className="py-2.5">{row.name}</td>
                          <td className="py-2.5 text-right font-medium" style={{ color: row.points === "—" ? WAGYR_MUTED : WAGYR_GREEN }}>{row.points}</td>
                          <td className="py-2.5 text-right">{row.correct}/{row.total}</td>
                          <td className="py-2.5 text-right text-xs" style={{ color: WAGYR_MUTED }}>{row.conviction}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Spotlight event (featured) */}
            <Card className="overflow-hidden border-0" style={{ background: WAGYR_CARD }}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 border-0 pb-2">
                <div>
                  <CardDescription className="text-xs uppercase tracking-wider" style={{ color: WAGYR_MUTED }}>
                    Spotlight · This week&apos;s slate
                  </CardDescription>
                  <CardTitle className="mt-1 text-lg font-semibold text-white">
                    {loading ? "Loading…" : featured ? featured.title : "No open markets"}
                  </CardTitle>
                </div>
                {featured && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="text-white/60 hover:bg-white/10 hover:text-white">
                      <ShareNetwork className="size-4" weight="bold" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white/60 hover:bg-white/10 hover:text-white">
                      <BookmarkSimple className="size-4" weight="bold" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              {loading && (
                <CardContent className="flex h-32 items-center justify-center">
                  <CircleNotch className="size-8 animate-spin" style={{ color: WAGYR_GREEN }} weight="bold" />
                </CardContent>
              )}
              {!loading && featured && (
                <CardContent className="space-y-4 pt-0">
                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full px-3 py-1 text-sm font-medium" style={{ background: "rgba(0,212,170,0.2)", color: WAGYR_GREEN }}>
                      YES {yesPercent(featured)}%
                    </span>
                    <span className="rounded-full px-3 py-1 text-sm font-medium text-white/70" style={{ background: "rgba(255,255,255,0.1)" }}>
                      NO {noPercent(featured)}%
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: WAGYR_MUTED }}>
                    <span style={{ color: WAGYR_GREEN }}>{formatVol(volume(featured))} vol</span>
                    <span>Closes {formatClose(featured.close_time)}</span>
                    <span>{themeFromSeries(featured.series_ticker)} · Kalshi</span>
                  </div>
                </CardContent>
              )}
              {!loading && !featured && markets.length === 0 && (
                <CardContent className="py-6 text-center text-sm text-white/60">No open markets right now. Check back later.</CardContent>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <Card className="border-0" style={{ background: WAGYR_CARD }}>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-semibold text-white">Your league</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <p className="text-xs" style={{ color: WAGYR_MUTED }}>
                  Create a league or get an invite code to join. You’ll see this week’s slate and live standings here.
                </p>
                <Button className="w-full font-medium text-[#171b2c] hover:opacity-90" style={{ background: WAGYR_GREEN }} size="sm">
                  Join with code
                </Button>
              </CardContent>
            </Card>
            <Card className="border-0" style={{ background: WAGYR_CARD }}>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-semibold text-white">This week&apos;s theme</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-white/80">
                  <strong className="text-white">{currentTheme}</strong> — Elections, tariffs, and global events. All events in this week’s slate are drawn from real Kalshi markets in this category.
                </p>
                <p className="mt-2 text-xs" style={{ color: WAGYR_MUTED }}>
                  Themes rotate weekly. Next week could be Fed policy, earnings, or another category.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0" style={{ background: WAGYR_CARD }}>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-sm font-semibold text-white">Moving markets</CardTitle>
                <CaretRight className="size-4" style={{ color: WAGYR_MUTED }} weight="bold" />
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg py-2">
                        <div className="h-4 flex-1 rounded bg-white/10" />
                        <div className="h-4 w-10 rounded bg-white/10" />
                      </div>
                    ))
                  : breaking.map((m) => {
                      const change = yesChangePercent(m)
                      return (
                        <div key={m.ticker} className="flex items-center justify-between gap-2 rounded-lg py-2 px-2 -mx-2 hover:bg-white/5">
                          <span className="min-w-0 flex-1 truncate text-sm text-white/90">{m.title}</span>
                          <span className="shrink-0 text-sm font-medium text-white">{yesPercent(m)}%</span>
                          <span className="text-xs font-medium shrink-0" style={{ color: change >= 0 ? WAGYR_GREEN : "#f87171" }}>
                            {change >= 0 ? "▲" : "▼"} {Math.abs(change)}%
                          </span>
                        </div>
                      )
                    })}
              </CardContent>
            </Card>
            <Card className="border-0" style={{ background: WAGYR_CARD }}>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-sm font-semibold text-white">Theme categories</CardTitle>
                <CaretRight className="size-4" style={{ color: WAGYR_MUTED }} weight="bold" />
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {WEEKLY_THEMES.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 rounded-lg py-2 px-2 -mx-2 hover:bg-white/5">
                    <t.icon className="size-4 shrink-0" style={{ color: WAGYR_GREEN }} weight="bold" />
                    <span className="text-sm text-white/90">{t.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* This week's slate — full event list */}
        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">This week&apos;s slate</h2>
              <p className="mt-1 text-sm" style={{ color: WAGYR_MUTED }}>
                Curated Kalshi events for your league. Make your YES/NO picks before each market closes.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-white/70 hover:bg-white/10 hover:text-white">Fed</Button>
              <Button variant="ghost" size="sm" className="text-white/70 hover:bg-white/10 hover:text-white">Geo</Button>
              <Button variant="ghost" size="sm" className="text-white/70 hover:bg-white/10 hover:text-white">All</Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <Card key={i} className="border-0" style={{ background: WAGYR_CARD }}>
                    <CardHeader className="pb-2">
                      <div className="h-3 w-20 rounded bg-white/10" />
                      <div className="mt-2 h-5 w-full rounded bg-white/10" />
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-4">
                        <div className="h-4 w-16 rounded bg-white/10" />
                        <div className="h-4 w-24 rounded bg-white/10" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              : gridMarkets.map((m) => (
                  <Card
                    key={m.ticker}
                    className="cursor-pointer border-0 transition-colors hover:opacity-95"
                    style={{ background: WAGYR_CARD }}
                  >
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs" style={{ color: WAGYR_MUTED }}>
                        {themeFromSeries(m.series_ticker)} · Closes {formatClose(m.close_time)}
                      </CardDescription>
                      <CardTitle className="text-sm font-medium text-white line-clamp-2">{m.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium" style={{ color: WAGYR_GREEN }}>
                          YES {yesPercent(m)}% · NO {noPercent(m)}%
                        </span>
                        <span className="text-xs" style={{ color: WAGYR_MUTED }}>
                          {formatVol(volume(m))} vol
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </section>

        {/* Weekly themes */}
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-white">Weekly themes</h2>
          <p className="mb-6 max-w-2xl text-sm" style={{ color: WAGYR_MUTED }}>
            Each week we pick a theme and curate events from Kalshi so your league stays focused and the game tracks the news cycle.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WEEKLY_THEMES.map((t) => (
              <Card key={t.id} className="border-0" style={{ background: WAGYR_CARD }}>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "rgba(0,212,170,0.15)" }}>
                    <t.icon className="size-5" style={{ color: WAGYR_GREEN }} weight="bold" />
                  </div>
                  <CardTitle className="text-base text-white">{t.name}</CardTitle>
                  <CardDescription className="text-sm" style={{ color: WAGYR_MUTED }}>{t.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Built on real markets + CTA */}
        <section className="mt-16 rounded-xl border px-6 py-8 md:px-10 md:py-10" style={{ borderColor: WAGYR_BORDER, background: WAGYR_CARD }}>
          <h2 className="text-xl font-semibold text-white">Built on real prediction markets</h2>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: WAGYR_MUTED }}>
            Wagyr uses live markets from Kalshi — a regulated prediction market. Event outcomes and odds are real. Your league&apos;s slate is curated from these markets so you compete on the same events that move with the news. No fake odds; no fake outcomes.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" className="font-semibold text-[#171b2c] hover:opacity-80" style={{ background: WAGYR_GREEN }}>
              Get started — create a league
            </Button>
            <Button variant="outline" size="lg" className="border-white/20 text-foreground hover:bg-white/70">
              How it works
            </Button>
          </div>
        </section>
      </main>
    </>
  )
}
