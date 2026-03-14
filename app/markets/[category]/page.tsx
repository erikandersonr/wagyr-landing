"use client"

import { useState } from "react"
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

const WAGYR_GREEN = "#00d4aa"
const WAGYR_CARD = "#1e2337"
const WAGYR_BORDER = "rgba(255,255,255,0.08)"
const WAGYR_MUTED = "rgba(255,255,255,0.5)"

/** Mock markets for each category — placeholder data */
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

export default function CategoryPage() {
  const params = useParams()
  const categoryId = params.category as string

  // Validate category
  const category = KALSHI_CATEGORIES.find((c) => c.id === categoryId)
  if (!category || categoryId === "home") {
    notFound()
  }

  const subcategories = KALSHI_SUBCATEGORIES[categoryId as Exclude<KalshiCategoryId, "home">]
  const [activeSubcategory, setActiveSubcategory] = useState("all")

  const mockMarkets = getMockMarkets(categoryId, activeSubcategory)

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      {/* Category title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{category.label}</h1>
        <p className="mt-2 text-sm" style={{ color: WAGYR_MUTED }}>
          Browse {category.label.toLowerCase()} prediction markets. Pick a subcategory to focus your league.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        {/* Subcategory sidebar */}
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

        {/* Market cards grid */}
        <div>
          {/* Filter bar */}
          <div className="mb-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#171b2c]"
              style={{ background: WAGYR_GREEN }}
            >
              Trending
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              New
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              Closing soon
            </Button>
          </div>

          {/* Cards */}
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
        </div>
      </div>
    </main>
  )
}
