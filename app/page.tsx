"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  MagnifyingGlass,
  Info,
  BookmarkSimple,
  TrendUp,
  Flame,
  CaretRight,
  ShareNetwork,
} from "@phosphor-icons/react"

const WAGYR_BG = "#171b2c"
const WAGYR_GREEN = "#00d4aa"
const WAGYR_CARD = "#1e2337"
const WAGYR_BORDER = "rgba(255,255,255,0.08)"
const WAGYR_MUTED = "rgba(255,255,255,0.5)"

const CATEGORIES = [
  "Trending",
  "Fed policy",
  "Geopolitics",
  "Earnings",
  "Elections",
  "More",
]

const BREAKING = [
  { q: "Will the Fed cut rates in March?", pct: 72, change: 12 },
  { q: "S&P 500 above 5,500 by month end?", pct: 58, change: -5 },
  { q: "Bitcoin above $80K by Friday?", pct: 41, change: 8 },
]

const HOT_TOPICS = [
  { name: "Fed policy", vol: "$2.1M" },
  { name: "Geopolitics", vol: "$1.8M" },
  { name: "Tech earnings", vol: "$1.2M" },
  { name: "Elections", vol: "$980K" },
]

const SAMPLE_MARKETS = [
  { title: "Fed cuts in March?", theme: "Fed policy", yes: 72 },
  { title: "S&P 500 > 5,500 by 3/31?", theme: "Earnings", yes: 58 },
  { title: "BTC above $80K this week?", theme: "Crypto", yes: 41 },
  { title: "New tariff announcement by 3/20?", theme: "Geopolitics", yes: 65 },
  { title: "Apple stock up after event?", theme: "Earnings", yes: 54 },
  { title: "Election poll shift >3%?", theme: "Elections", yes: 38 },
]

export default function Page() {
  return (
    <div
      className="wagyr-landing min-h-screen"
      style={{ background: WAGYR_BG }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 border-b px-4 py-3 md:px-6" style={{ borderColor: WAGYR_BORDER, background: WAGYR_BG }}>
        <div className="mx-auto flex max-w-7xl items-center gap-4 justify-between">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src="/logo.png"
              alt="Wagyr"
              width={120}
              height={120}
              className="rounded-lg"
            />
          </Link>
          <div className="relative hidden flex-1 max-w-md">
            <MagnifyingGlass
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
              style={{ color: WAGYR_MUTED }}
              weight="bold"
            />
            <Input
              placeholder="Search events..."
              className="h-9 border-0 pl-9 text-white placeholder:opacity-60"
              style={{ background: WAGYR_CARD }}
            />
          </div>
          <nav className="flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Info className="size-4" weight="bold" />
              How it works
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-foreground hover:bg-white/70"
            >
              Log in
            </Button>
            <Button
              size="sm"
              className="font-medium text-[#171b2c] hover:opacity-80"
              style={{ background: WAGYR_GREEN }}
            >
              Sign up
            </Button>
          </nav>
        </div>
      </header>

      {/* Category nav */}
      <div className="border-b px-4 py-2 md:px-6" style={{ borderColor: WAGYR_BORDER }}>
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg px-4 ${
                cat === "Trending"
                  ? "text-[#171b2c]"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
              style={cat === "Trending" ? { background: WAGYR_GREEN } : undefined}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Main + sidebar */}
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Featured event card */}
          <Card
            className="overflow-hidden border-0"
            style={{ background: WAGYR_CARD }}
          >
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-0 pb-2">
              <div>
                <CardDescription
                  className="text-xs uppercase tracking-wider"
                  style={{ color: WAGYR_MUTED }}
                >
                  Geopolitics · This week
                </CardDescription>
                <CardTitle className="mt-1 text-lg font-semibold text-white">
                  Will the Fed cut rates at the March meeting?
                </CardTitle>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <ShareNetwork className="size-4" weight="bold" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <BookmarkSimple className="size-4" weight="bold" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="flex flex-wrap gap-3">
                <span
                  className="rounded-full px-3 py-1 text-sm font-medium"
                  style={{ background: "rgba(0,212,170,0.2)", color: WAGYR_GREEN }}
                >
                  YES 72%
                </span>
                <span
                  className="rounded-full px-3 py-1 text-sm font-medium text-white/70"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  NO 28%
                </span>
              </div>
              {/* Placeholder chart area */}
              <div
                className="h-40 rounded-lg flex items-center justify-center text-sm"
                style={{ background: "rgba(0,0,0,0.2)", color: WAGYR_MUTED }}
              >
                Probability trend (Mar 1 → Mar 14)
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: WAGYR_MUTED }}>
                <span style={{ color: WAGYR_GREEN }}>+$26 vol</span>
                <span>Based on Kalshi market</span>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <aside className="space-y-6">
            <Card
              className="border-0"
              style={{ background: WAGYR_CARD }}
            >
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-sm font-semibold text-white">
                  Breaking
                </CardTitle>
                <CaretRight className="size-4" style={{ color: WAGYR_MUTED }} weight="bold" />
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {BREAKING.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 rounded-lg py-2 px-2 -mx-2 hover:bg-white/5"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm text-white/90">
                      {item.q}
                    </span>
                    <span className="shrink-0 text-sm font-medium text-white">
                      {item.pct}%
                    </span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: item.change >= 0 ? WAGYR_GREEN : "#f87171" }}
                    >
                      {item.change >= 0 ? "▲" : "▼"} {Math.abs(item.change)}%
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card
              className="border-0"
              style={{ background: WAGYR_CARD }}
            >
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-sm font-semibold text-white">
                  Hot this week
                </CardTitle>
                <CaretRight className="size-4" style={{ color: WAGYR_MUTED }} weight="bold" />
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {HOT_TOPICS.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 rounded-lg py-2 px-2 -mx-2 hover:bg-white/5"
                  >
                    <span className="flex items-center gap-2 text-sm text-white/90">
                      <Flame className="size-4 shrink-0" style={{ color: WAGYR_GREEN }} weight="fill" />
                      {t.name}
                    </span>
                    <span className="text-xs" style={{ color: WAGYR_MUTED }}>
                      {t.vol}
                    </span>
                    <CaretRight className="size-3" style={{ color: WAGYR_MUTED }} weight="bold" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Button
              variant="outline"
              className="w-full border-white/20 text-foreground hover:bg-white/10"
            >
              Explore all
            </Button>
          </aside>
        </div>

        {/* This week's events */}
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
            <h2 className="text-lg font-semibold text-white">
              This week&apos;s events
            </h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:bg-white/10 hover:text-white"
              >
                Fed policy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:bg-white/10 hover:text-white"
              >
                Geopolitics
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:bg-white/10 hover:text-white"
              >
                All
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {SAMPLE_MARKETS.map((m, i) => (
              <Card
                key={i}
                className="cursor-pointer border-0 transition-colors hover:opacity-95"
                style={{ background: WAGYR_CARD }}
              >
                <CardHeader className="pb-2">
                  <CardDescription
                    className="text-xs"
                    style={{ color: WAGYR_MUTED }}
                  >
                    {m.theme}
                  </CardDescription>
                  <CardTitle className="text-sm font-medium text-white line-clamp-2">
                    {m.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm font-medium"
                      style={{ color: WAGYR_GREEN }}
                    >
                      YES {m.yes}%
                    </span>
                    <TrendUp className="size-4" style={{ color: WAGYR_MUTED }} weight="bold" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Hero copy */}
        <section className="mx-auto mt-16 max-w-2xl text-center">
          <p className="text-lg leading-relaxed text-white/80">
            Wagyr is a mobile fantasy league built on real prediction markets.
            Compete weekly by calling <strong className="text-white">YES</strong> or{" "}
            <strong className="text-white">NO</strong> on curated Kalshi events,
            earn points based on accuracy and conviction, and climb a live
            leaderboard against friends. Every week has a rotating theme — Fed
            policy, geopolitics, earnings, elections — so the game moves with
            the news cycle and rewards whoever actually understands the world.
          </p>
          <Button
            size="lg"
            className="mt-6 font-semibold text-[#171b2c] hover:opacity-90"
            style={{ background: WAGYR_GREEN }}
          >
            Get started
          </Button>
        </section>
      </main>
    </div>
  )
}
