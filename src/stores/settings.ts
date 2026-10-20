import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppSettings } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { callGAS, setGasUrl } from '../lib/gas'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>({ ...DEFAULT_SETTINGS })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load from localStorage first (instant), then sync from GAS
  function loadLocal() {
    try {
      const raw = localStorage.getItem('ttj_settings')
      if (raw) {
        settings.value = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
      }
    } catch {
      // ignore
    }
  }

  async function fetchSettings() {
    loading.value = true
    error.value = null
    try {
      const res = await callGAS<Record<string, string>>('getSettings')
      if (res.success && res.data) {
        const remote = parseRemoteSettings(res.data)
        settings.value = { ...DEFAULT_SETTINGS, ...remote }
        persistLocal()
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load settings'
    } finally {
      loading.value = false
    }
  }

  async function saveSettings(newSettings: Partial<AppSettings>) {
    settings.value = { ...settings.value, ...newSettings }
    persistLocal()

    // Sync GAS URL to gas lib
    if (newSettings.gas_url) {
      setGasUrl(newSettings.gas_url)
    }

    // Persist to Google Sheet
    const res = await callGAS('updateSettings', serializeSettings(settings.value))
    return res.success
  }

  function persistLocal() {
    localStorage.setItem('ttj_settings', JSON.stringify(settings.value))
  }

  function parseRemoteSettings(data: Record<string, string>): Partial<AppSettings> {
    return {
      starting_balance: parseFloat(data.starting_balance) || DEFAULT_SETTINGS.starting_balance,
      default_risk_pct: parseFloat(data.default_risk_pct) || DEFAULT_SETTINGS.default_risk_pct,
      daily_loss_limit: parseFloat(data.daily_loss_limit) || DEFAULT_SETTINGS.daily_loss_limit,
      max_trades_per_day: parseInt(data.max_trades_per_day) || DEFAULT_SETTINGS.max_trades_per_day,
      symbols: data.symbols ? data.symbols.split(',').map(s => s.trim()) : DEFAULT_SETTINGS.symbols,
      setups: data.setups ? data.setups.split(',').map(s => s.trim()) : DEFAULT_SETTINGS.setups,
      mistake_tags: data.mistake_tags ? data.mistake_tags.split(',').map(s => s.trim()) : DEFAULT_SETTINGS.mistake_tags,
    }
  }

  function serializeSettings(s: AppSettings): Record<string, string> {
    return {
      starting_balance: String(s.starting_balance),
      default_risk_pct: String(s.default_risk_pct),
      daily_loss_limit: String(s.daily_loss_limit),
      max_trades_per_day: String(s.max_trades_per_day),
      symbols: s.symbols.join(','),
      setups: s.setups.join(','),
      mistake_tags: s.mistake_tags.join(','),
    }
  }

  // Initialize
  loadLocal()
  if (settings.value.gas_url) setGasUrl(settings.value.gas_url)

  return {
    settings,
    loading,
    error,
    fetchSettings,
    saveSettings,
  }
})
