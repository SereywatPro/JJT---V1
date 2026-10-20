// ─── Trade ───────────────────────────────────────────────────────────────────

export type Market = 'Forex' | 'Crypto' | 'Stock' | 'Futures'
export type Direction = 'Long' | 'Short'
export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1D' | '1W' | 'MN'
export type TradeResult = 'Win' | 'Loss' | 'Breakeven'
export type Emotion = 'Calm' | 'Fear' | 'Greed' | 'FOMO' | 'Revenge' | 'Confident'

export interface Trade {
  trade_id: string
  date_open: string        // ISO datetime string
  date_close: string       // ISO datetime string
  symbol: string
  market: Market
  direction: Direction
  setup: string
  timeframe: Timeframe
  entry_price: number
  stop_loss: number
  take_profit: number
  exit_price: number
  position_size: number
  fees: number
  account_balance: number
  risk_amount: number      // auto-calculated
  pnl: number              // auto-calculated, net of fees
  r_multiple: number       // auto-calculated
  result: TradeResult      // auto-calculated
  emotion: Emotion
  followed_plan: boolean
  mistake_tags: string[]   // multi-select
  notes: string
  screenshot_url: string
}

export type TradeFormData = Omit<Trade, 'trade_id'>

// ─── Daily Review ─────────────────────────────────────────────────────────────

export type Mood = 'Great' | 'Good' | 'Neutral' | 'Bad' | 'Terrible'

export interface DailyReview {
  date: string             // YYYY-MM-DD
  mood: Mood
  trades_count: number     // auto-filled
  daily_pnl: number        // auto-filled
  went_well: string
  to_improve: string
  plan_tomorrow: string
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface AppSettings {
  starting_balance: number
  default_risk_pct: number
  daily_loss_limit: number
  max_trades_per_day: number
  symbols: string[]
  setups: string[]
  mistake_tags: string[]
  gas_url: string
  app_password: string     // hashed in localStorage only
}

export const DEFAULT_SETTINGS: AppSettings = {
  starting_balance: 10000,
  default_risk_pct: 1,
  daily_loss_limit: 300,
  max_trades_per_day: 5,
  symbols: ['XAUUSD', 'EURUSD', 'BTCUSDT', 'ETHUSDT', 'NAS100', 'US30'],
  setups: ['Breakout', 'Pullback', 'Reversal', 'Scalp', 'Trend Follow'],
  mistake_tags: ['Early exit', 'Moved SL', 'Overtrade', 'No setup', 'FOMO entry', 'Late entry', 'Wrong size'],
  gas_url: '',
  app_password: '',
}

// ─── Chart / Stats ────────────────────────────────────────────────────────────

export interface EquityPoint {
  date: string
  balance: number
  pnl: number
}

export interface DashboardStats {
  totalPnl: number
  winRate: number
  profitFactor: number
  expectancy: number
  avgR: number
  maxDrawdown: number
  bestTrade: number   // pnl value of best trade
  worstTrade: number  // pnl value of worst trade
  totalTrades: number
  wins: number
  losses: number
  avgWin: number
  avgLoss: number
  followedPlanPct: number
  followedPlanCount: number
  topEmotion: string
  topMistake: string
}

// ─── GAS Response ─────────────────────────────────────────────────────────────

export interface GasResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// ─── Queue ────────────────────────────────────────────────────────────────────

export interface QueuedAction {
  id: string
  action: string
  payload: unknown
  timestamp: string
}
