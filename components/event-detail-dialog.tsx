"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { CircleNotch } from "@phosphor-icons/react"
import type {
  KalshiEvent,
  KalshiMarket,
  KalshiOrderbook,
  KalshiTrade,
} from "@/lib/kalshi"
import {
  yesPercent,
  volume,
  formatVol,
  timeUntilClose,
} from "@/lib/kalshi"

const WAGYR_GREEN = "#00d4aa"
const WAGYR_CARD = "#1e2337"
const WAGYR_BG = "#171b2c"
const WAGYR_BORDER = "rgba(255,255,255,0.08)"
const WAGYR_MUTED = "rgba(255,255,255,0.5)"

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  if (diff < 60000) return "just now"
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

type Props = {
  event: KalshiEvent
  trigger: React.ReactNode
}

export function EventDetailDialog({ event, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const markets = event.markets ?? []
  const sorted = [...markets].sort((a, b) => yesPercent(b) - yesPercent(a))
  const [selectedIdx, setSelectedIdx] = useState(0)
  const selectedMarket = sorted[selectedIdx] ?? null

  const [orderbook, setOrderbook] = useState<KalshiOrderbook | null>(null)
  const [trades, setTrades] = useState<KalshiTrade[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    if (open) setSelectedIdx(0)
  }, [open])

  useEffect(() => {
    if (!open || !selectedMarket) return
    setDetailLoading(true)
    setOrderbook(null)
    setTrades([])

    Promise.allSettled([
      fetch(`/api/kalshi/orderbook?ticker=${selectedMarket.ticker}`).then((r) => r.json()),
      fetch(`/api/kalshi/trades?ticker=${selectedMarket.ticker}&limit=20`).then((r) => r.json()),
    ]).then(([obResult, trResult]) => {
      if (obResult.status === "fulfilled") setOrderbook(obResult.value.orderbook ?? null)
      if (trResult.status === "fulfilled") setTrades(trResult.value.trades ?? [])
      setDetailLoading(false)
    })
  }, [open, selectedMarket?.ticker])

  const leadingOutcome = sorted[0]
  const totalVol = markets.reduce((sum, m) => sum + volume(m), 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="sm:max-w-3xl max-h-[90vh] overflow-y-auto"
        style={{ background: WAGYR_CARD, color: "white" }}
      >
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogDescription className="flex items-center gap-2 text-xs" style={{ color: WAGYR_MUTED }}>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: "rgba(0,212,170,0.15)", color: WAGYR_GREEN }}>
                {event.category}
              </span>
            </DialogDescription>
            <div className="flex items-center gap-2">
              {selectedMarket && (
                <span className="text-xs" style={{ color: WAGYR_MUTED }}>
                  {timeUntilClose(selectedMarket)}
                </span>
              )}
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: "rgba(0,212,170,0.15)", color: WAGYR_GREEN }}>
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: WAGYR_GREEN }} />
                Live
              </span>
            </div>
          </div>
          <DialogTitle className="text-xl text-white">{event.title}</DialogTitle>
          {event.sub_title && (
            <p className="text-sm" style={{ color: WAGYR_MUTED }}>{event.sub_title}</p>
          )}
        </DialogHeader>

        {/* Leading Outcome */}
        {leadingOutcome && (
          <div className="flex items-center gap-3 rounded-lg px-4 py-3" style={{ background: WAGYR_BG }}>
            <span className="text-xs" style={{ color: WAGYR_MUTED }}>Leading Outcome</span>
            <span className="text-sm font-medium text-white">{leadingOutcome.yes_sub_title || leadingOutcome.title}</span>
            <span className="ml-auto text-sm font-semibold" style={{ color: WAGYR_GREEN }}>{yesPercent(leadingOutcome)}%</span>
          </div>
        )}

        {/* Outcome Selector — all markets as buttons */}
        {markets.length > 0 && (
          <div>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
              {sorted.map((m, i) => (
                <button
                  key={m.ticker}
                  onClick={() => setSelectedIdx(i)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                    selectedIdx === i ? "" : "hover:bg-white/5"
                  }`}
                  style={{
                    background: selectedIdx === i ? "rgba(0,212,170,0.1)" : WAGYR_BG,
                    outline: selectedIdx === i ? `1px solid ${WAGYR_GREEN}` : "none",
                  }}
                >
                  <span className="text-white/80">{m.yes_sub_title || m.title}</span>
                  <span className="font-medium" style={{ color: WAGYR_GREEN }}>{yesPercent(m)}%</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedMarket && (
          <>
            {/* Current Price */}
            <div className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: WAGYR_BG }}>
              <div>
                <p className="text-xs" style={{ color: WAGYR_MUTED }}>Current Price</p>
                <p className="text-lg font-semibold" style={{ color: WAGYR_GREEN }}>{yesPercent(selectedMarket)}%</p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: WAGYR_MUTED }}>Volume</p>
                <p className="text-sm font-medium text-white">{formatVol(totalVol)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: WAGYR_MUTED }}>Markets</p>
                <p className="text-sm font-medium text-white">{markets.length}</p>
              </div>
            </div>

            {detailLoading && (
              <div className="flex items-center justify-center py-8">
                <CircleNotch className="size-6 animate-spin" style={{ color: WAGYR_GREEN }} weight="bold" />
              </div>
            )}

            {/* Order Book */}
            {!detailLoading && orderbook && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-medium uppercase tracking-wider" style={{ color: WAGYR_MUTED }}>Order Book</h3>
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: WAGYR_GREEN }}>
                    <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: WAGYR_GREEN }} />
                    LIVE
                  </span>
                </div>
                <div className="rounded-lg border" style={{ borderColor: WAGYR_BORDER }}>
                  <div className="flex items-center justify-between border-b px-3 py-1.5 text-[10px] font-medium uppercase" style={{ borderColor: WAGYR_BORDER, color: WAGYR_MUTED }}>
                    <span>Price</span>
                    <span>Size</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {(orderbook.yes ?? []).length === 0 && (orderbook.no ?? []).length === 0 && (
                      <p className="px-3 py-3 text-center text-xs" style={{ color: WAGYR_MUTED }}>No orders available</p>
                    )}
                    {(orderbook.yes ?? []).map((level, i) => (
                      <div key={`y${i}`} className="flex items-center justify-between px-3 py-1 text-xs">
                        <span style={{ color: WAGYR_GREEN }}>{parseFloat(level[0]).toFixed(2)}&#162;</span>
                        <span className="text-white/70">{Math.round(parseFloat(level[1]))}</span>
                      </div>
                    ))}
                    {(orderbook.no ?? []).map((level, i) => (
                      <div key={`n${i}`} className="flex items-center justify-between px-3 py-1 text-xs">
                        <span style={{ color: "#f87171" }}>{parseFloat(level[0]).toFixed(2)}&#162;</span>
                        <span className="text-white/70">{Math.round(parseFloat(level[1]))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Trades */}
            {!detailLoading && trades.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-medium uppercase tracking-wider" style={{ color: WAGYR_MUTED }}>Recent Trades</h3>
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: WAGYR_GREEN }}>
                    <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: WAGYR_GREEN }} />
                    LIVE
                  </span>
                </div>
                <div className="max-h-56 overflow-y-auto rounded-lg border" style={{ borderColor: WAGYR_BORDER }}>
                  {trades.map((t) => (
                    <div key={t.trade_id} className="flex items-center justify-between px-3 py-2 text-xs" style={{ borderBottom: `1px solid ${WAGYR_BORDER}` }}>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-medium"
                          style={{ color: WAGYR_GREEN }}
                        >
                          {(parseFloat(t.yes_price_dollars) * 100).toFixed(1)}&#162;
                        </span>
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{
                            background: t.taker_side === "yes" ? "rgba(0,212,170,0.15)" : "rgba(248,113,113,0.15)",
                            color: t.taker_side === "yes" ? WAGYR_GREEN : "#f87171",
                          }}
                        >
                          {t.taker_side.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white/70">{Math.round(parseFloat(t.count_fp))}</span>
                        <span style={{ color: WAGYR_MUTED }}>{relativeTime(t.created_time)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {markets.length === 0 && (
          <p className="text-sm" style={{ color: WAGYR_MUTED }}>No market data available for this event.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
