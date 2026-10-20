import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Trade, TradeFormData } from '../types'
import { callGAS } from '../lib/gas'
import { enqueue } from '../lib/queue'
import {
  calcRisk, calcPnl, calcRMultiple, calcResult
} from '../lib/calculations'

export const useTradesStore = defineStore('trades', () => {
  const trades = ref<Trade[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ─── Computed helpers ────────────────────────────────────────────
  const sortedTrades = computed(() =>
    [...trades.value].sort((a, b) =>
      new Date(b.date_close).getTime() - new Date(a.date_close).getTime()
    )
  )

  const todayTrades = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return trades.value.filter(t => t.date_close?.slice(0, 10) === today)
  })

  // ─── CRUD ────────────────────────────────────────────────────────
  async function fetchTrades() {
    loading.value = true
    error.value = null
    try {
      const res = await callGAS<Trade[]>('getTrades')
      if (res.success && res.data) {
        trades.value = res.data.map(normalizeTrade)
      } else {
        error.value = res.error || 'Failed to load trades'
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Network error'
    } finally {
      loading.value = false
    }
  }

  async function addTrade(formData: TradeFormData): Promise<{ success: boolean; trade_id?: string; error?: string }> {
    const trade = computeAutoFields(formData)

    // Optimistic: add to local state immediately
    const tempId = 'temp-' + Date.now()
    const optimistic: Trade = { ...trade, trade_id: tempId }
    trades.value.unshift(optimistic)

    const res = await callGAS<{ trade_id: string }>('addTrade', trade)

    if (res.success && res.data) {
      // Replace temp entry with real trade_id
      const idx = trades.value.findIndex(t => t.trade_id === tempId)
      if (idx !== -1) trades.value[idx].trade_id = res.data.trade_id
      return { success: true, trade_id: res.data.trade_id }
    } else {
      // Remove optimistic entry, queue for later
      trades.value = trades.value.filter(t => t.trade_id !== tempId)
      enqueue('addTrade', trade)
      return { success: false, error: res.error }
    }
  }

  async function updateTrade(tradeId: string, formData: TradeFormData): Promise<{ success: boolean; error?: string }> {
    const trade = computeAutoFields(formData)
    const full: Trade = { ...trade, trade_id: tradeId }

    // Optimistic update
    const idx = trades.value.findIndex(t => t.trade_id === tradeId)
    const backup = idx !== -1 ? { ...trades.value[idx] } : null
    if (idx !== -1) trades.value[idx] = full

    const res = await callGAS('updateTrade', full)
    if (!res.success) {
      // Rollback
      if (idx !== -1 && backup) trades.value[idx] = backup
      enqueue('updateTrade', full)
      return { success: false, error: res.error }
    }
    return { success: true }
  }

  async function deleteTrade(tradeId: string): Promise<{ success: boolean; error?: string }> {
    // Optimistic remove
    const backup = [...trades.value]
    trades.value = trades.value.filter(t => t.trade_id !== tradeId)

    const res = await callGAS('deleteTrade', { trade_id: tradeId })
    if (!res.success) {
      trades.value = backup
      return { success: false, error: res.error }
    }
    return { success: true }
  }

  // ─── Helpers ──────────────────────────────────────────────────────
  function computeAutoFields(form: TradeFormData): Omit<Trade, 'trade_id'> {
    const risk = calcRisk(form.entry_price, form.stop_loss, form.position_size, form.direction)
    const pnl  = calcPnl(form.exit_price, form.entry_price, form.position_size, form.direction, form.fees)
    const r    = calcRMultiple(pnl, risk)
    return {
      ...form,
      risk_amount: risk,
      pnl,
      r_multiple: r,
      result: calcResult(pnl),
    }
  }

  function normalizeTrade(t: Trade): Trade {
    return {
      ...t,
      entry_price: Number(t.entry_price),
      stop_loss: Number(t.stop_loss),
      take_profit: Number(t.take_profit),
      exit_price: Number(t.exit_price),
      position_size: Number(t.position_size),
      fees: Number(t.fees),
      account_balance: Number(t.account_balance),
      risk_amount: Number(t.risk_amount),
      pnl: Number(t.pnl),
      r_multiple: Number(t.r_multiple),
      followed_plan: t.followed_plan === true || String(t.followed_plan).toLowerCase() === 'yes',
      mistake_tags: Array.isArray(t.mistake_tags) ? t.mistake_tags : [],
    }
  }

  return {
    trades,
    loading,
    error,
    sortedTrades,
    todayTrades,
    fetchTrades,
    addTrade,
    updateTrade,
    deleteTrade,
  }
})
