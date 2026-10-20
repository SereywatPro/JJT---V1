import * as XLSX from 'xlsx'
import type { Trade } from '../types'
import { format } from 'date-fns'

export function exportToCSV(trades: Trade[], filename?: string): void {
  const wb = buildWorkbook(trades)
  const name = filename || `TTJ_Trades_${format(new Date(), 'yyyy-MM-dd')}.csv`
  XLSX.writeFile(wb, name, { bookType: 'csv' })
}

export function exportToXLSX(trades: Trade[], filename?: string): void {
  const wb = buildWorkbook(trades)
  const name = filename || `TTJ_Trades_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
  XLSX.writeFile(wb, name, { bookType: 'xlsx' })
}

function buildWorkbook(trades: Trade[]) {
  const headers = [
    'Trade ID', 'Date Open', 'Date Close', 'Symbol', 'Market', 'Direction',
    'Setup', 'Timeframe', 'Entry Price', 'Stop Loss', 'Take Profit', 'Exit Price',
    'Position Size', 'Fees', 'Account Balance', 'Risk Amount', 'P&L', 'R Multiple',
    'Result', 'Emotion', 'Followed Plan', 'Mistake Tags', 'Notes', 'Screenshot URL',
  ]

  const rows = trades.map(t => [
    t.trade_id,
    t.date_open,
    t.date_close,
    t.symbol,
    t.market,
    t.direction,
    t.setup,
    t.timeframe,
    t.entry_price,
    t.stop_loss,
    t.take_profit,
    t.exit_price,
    t.position_size,
    t.fees,
    t.account_balance,
    t.risk_amount,
    t.pnl,
    t.r_multiple,
    t.result,
    t.emotion,
    t.followed_plan ? 'Yes' : 'No',
    (t.mistake_tags || []).join(', '),
    t.notes,
    t.screenshot_url,
  ])

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

  // Style header row width
  ws['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 2, 14) }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Trades')
  return wb
}
