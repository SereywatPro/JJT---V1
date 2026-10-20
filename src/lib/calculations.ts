import type { Trade, DashboardStats } from '../types'

// ─── Trade-level calculations ────────────────────────────────────────────────

/**
 * Calculate risk amount in currency units.
 * For Long: (entry - SL) * size
 * For Short: (SL - entry) * size
 */
export function calcRisk(
  entry: number,
  sl: number,
  size: number,
  direction: 'Long' | 'Short'
): number {
  const pips = direction === 'Long' ? entry - sl : sl - entry
  return Math.abs(pips * size)
}

/**
 * Calculate net P&L after fees.
 * For Long:  (exit - entry) * size - fees
 * For Short: (entry - exit) * size - fees
 */
export function calcPnl(
  exit: number,
  entry: number,
  size: number,
  direction: 'Long' | 'Short',
  fees: number
): number {
  const gross = direction === 'Long'
    ? (exit - entry) * size
    : (entry - exit) * size
  return round(gross - fees, 2)
}

/** R-multiple = pnl / risk_amount */
export function calcRMultiple(pnl: number, risk: number): number {
  if (!risk || risk === 0) return 0
  return round(pnl / risk, 2)
}

/** Classify result from net P&L */
export function calcResult(pnl: number): 'Win' | 'Loss' | 'Breakeven' {
  if (pnl > 0) return 'Win'
  if (pnl < 0) return 'Loss'
  return 'Breakeven'
}

// ─── Portfolio statistics ────────────────────────────────────────────────────

export function calcWinRate(trades: Trade[]): number {
  if (trades.length === 0) return 0
  const wins = trades.filter(t => t.result === 'Win').length
  return round((wins / trades.length) * 100, 1)
}

export function calcProfitFactor(trades: Trade[]): number {
  const grossWin = trades.filter(t => t.pnl > 0).reduce((s, t) => s + t.pnl, 0)
  const grossLoss = Math.abs(trades.filter(t => t.pnl < 0).reduce((s, t) => s + t.pnl, 0))
  if (grossLoss === 0) return grossWin > 0 ? Infinity : 0
  return round(grossWin / grossLoss, 2)
}

export function calcExpectancy(trades: Trade[]): number {
  if (trades.length === 0) return 0
  const total = trades.reduce((s, t) => s + t.pnl, 0)
  return round(total / trades.length, 2)
}

export function calcAvgR(trades: Trade[]): number {
  if (trades.length === 0) return 0
  const sum = trades.reduce((s, t) => s + t.r_multiple, 0)
  return round(sum / trades.length, 2)
}

export function calcMaxDrawdown(trades: Trade[], startBalance: number): number {
  let peak = startBalance
  let maxDD = 0
  let running = startBalance

  for (const t of trades) {
    running += t.pnl
    if (running > peak) peak = running
    const dd = peak - running
    if (dd > maxDD) maxDD = dd
  }
  return round(maxDD, 2)
}

export function buildEquityCurve(
  trades: Trade[],
  startBalance: number
): { date: string; equity: number }[] {
  const sorted = [...trades].sort((a, b) =>
    new Date(a.date_close).getTime() - new Date(b.date_close).getTime()
  )

  let balance = startBalance
  const curve: { date: string; equity: number }[] = [
    { date: 'Start', equity: balance },
  ]

  for (const t of sorted) {
    balance = round(balance + t.pnl, 2)
    curve.push({
      date: t.date_close.slice(0, 10),
      equity: balance,
    })
  }
  return curve
}

/** Group net P&L by day of week → Record<dayIndex, pnl>  (1=Mon … 7=Sun) */
export function groupByDayOfWeek(trades: Trade[]): Record<number, number> {
  const totals: Record<number, number> = {}
  for (const t of trades) {
    const d = new Date(t.date_close).getDay() // 0=Sun
    // remap to 1=Mon…7=Sun
    const key = d === 0 ? 7 : d
    totals[key] = round((totals[key] ?? 0) + t.pnl, 2)
  }
  return totals
}

/** Group net P&L by symbol → Record<symbol, pnl> */
export function groupBySymbol(trades: Trade[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const t of trades) {
    map[t.symbol] = round((map[t.symbol] ?? 0) + t.pnl, 2)
  }
  return map
}

/** Group net P&L by setup → Record<setup, pnl> */
export function groupBySetup(trades: Trade[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const t of trades) {
    const key = t.setup || 'Unknown'
    map[key] = round((map[key] ?? 0) + t.pnl, 2)
  }
  return map
}

/** Count emotion occurrences → Record<emotion, count> */
export function groupByEmotion(trades: Trade[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const t of trades) {
    const key = t.emotion || 'Unknown'
    map[key] = (map[key] ?? 0) + 1
  }
  return map
}

/** Count mistake tag occurrences → Record<tag, count> */
export function groupByMistakeTag(trades: Trade[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const t of trades) {
    for (const tag of t.mistake_tags ?? []) {
      map[tag] = (map[tag] ?? 0) + 1
    }
  }
  return map
}

/** Sum P&L per calendar day: { 'YYYY-MM-DD': pnl } */
export function pnlByDay(trades: Trade[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const t of trades) {
    const day = t.date_close.slice(0, 10)
    map[day] = round((map[day] ?? 0) + t.pnl, 2)
  }
  return map
}

/** Build all dashboard stats in one pass */
export function buildDashboardStats(trades: Trade[]): DashboardStats {
  const wins = trades.filter(t => t.result === 'Win')
  const losses = trades.filter(t => t.result === 'Loss')
  const totalPnl = round(trades.reduce((s, t) => s + t.pnl, 0), 2)
  const avgWin = wins.length ? round(wins.reduce((s, t) => s + t.pnl, 0) / wins.length, 2) : 0
  const avgLoss = losses.length ? round(losses.reduce((s, t) => s + t.pnl, 0) / losses.length, 2) : 0

  const followedCount = trades.filter(t => t.followed_plan).length
  const followedPlanPct = trades.length ? round((followedCount / trades.length) * 100, 1) : 0

  // Top emotion
  const emotionMap = groupByEmotion(trades)
  const topEmotion = Object.entries(emotionMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''

  // Top mistake
  const mistakeMap = groupByMistakeTag(trades)
  const topMistake = Object.entries(mistakeMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''

  const startBalance = 10000 // fallback; caller can pass their own balance
  const maxDrawdown = calcMaxDrawdown(trades, startBalance)

  return {
    totalPnl,
    winRate: calcWinRate(trades),
    profitFactor: calcProfitFactor(trades),
    expectancy: calcExpectancy(trades),
    avgR: calcAvgR(trades),
    maxDrawdown,
    bestTrade: trades.length ? Math.max(...trades.map(t => t.pnl)) : 0,
    worstTrade: trades.length ? Math.min(...trades.map(t => t.pnl)) : 0,
    totalTrades: trades.length,
    wins: wins.length,
    losses: losses.length,
    avgWin,
    avgLoss,
    followedPlanPct,
    followedPlanCount: followedCount,
    topEmotion,
    topMistake,
  }
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function round(n: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(n * factor) / factor
}
