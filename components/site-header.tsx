"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Info } from "@phosphor-icons/react"
import { KALSHI_CATEGORIES } from "@/lib/kalshi"
import type { KalshiCategoryId } from "@/lib/kalshi"

const WAGYR_BG = "#171b2c"
const WAGYR_GREEN = "#00d4aa"
const WAGYR_BORDER = "rgba(255,255,255,0.08)"

function getActiveCategory(pathname: string): KalshiCategoryId {
  const match = pathname.match(/^\/markets\/([^/]+)/)
  if (match) return match[1] as KalshiCategoryId
  return "home"
}

export function SiteHeader() {
  const pathname = usePathname()
  const activeCategory = getActiveCategory(pathname)

  return (
    <>
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b px-4 py-3 md:px-6"
        style={{ borderColor: WAGYR_BORDER, background: WAGYR_BG }}
      >
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
          <nav className="flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Info className="size-4" weight="bold" />
              How it works
            </Button>
            <Link href="/sign-in">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-foreground hover:bg-white/70"
              >
                Log in
              </Button>
            </Link>
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
      <div
        className="border-b px-4 py-2 md:px-6"
        style={{ borderColor: WAGYR_BORDER }}
      >
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto pb-1">
          {KALSHI_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id
            const href = cat.id === "home" ? "/" : `/markets/${cat.id}`
            return (
              <Link key={cat.id} href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`shrink-0 rounded-lg px-4 ${isActive
                      ? "text-[#171b2c]"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  style={isActive ? { background: WAGYR_GREEN } : undefined}
                >
                  {cat.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
