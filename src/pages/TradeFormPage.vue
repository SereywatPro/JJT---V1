<template>
  <Layout>
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <router-link to="/trades" class="text-neutral-400 hover:text-white transition-colors">
          <ArrowLeft :size="20" />
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-white">{{ isEdit ? 'Edit Trade' : 'Add Trade' }}</h1>
          <p class="text-sm text-neutral-400 mt-0.5">{{ isEdit ? 'Update this trade record' : 'Log a new trade in under 30 seconds' }}</p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- WHEN -->
        <Card>
          <h2 class="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
            <Clock :size="15" /> When
          </h2>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                Date Open <span class="text-red-400">*</span>
              </label>
              <input
                v-model="form.date_open"
                type="datetime-local"
                class="input-base"
                :class="errors.date_open ? 'border-red-500' : ''"
                required
              />
              <p v-if="errors.date_open" class="text-xs text-red-400">{{ errors.date_open }}</p>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                Date Close <span class="text-red-400">*</span>
              </label>
              <input
                v-model="form.date_close"
                type="datetime-local"
                class="input-base"
                :class="errors.date_close ? 'border-red-500' : ''"
                required
              />
              <p v-if="errors.date_close" class="text-xs text-red-400">{{ errors.date_close }}</p>
            </div>
          </div>
        </Card>

        <!-- WHAT -->
        <Card>
          <h2 class="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
            <TrendingUp :size="15" /> Instrument & Setup
          </h2>
          <div class="grid grid-cols-2 gap-4">
            <Select
              v-model="form.symbol"
              label="Symbol"
              :options="settingsStore.settings.symbols"
              placeholder="Select symbol"
              :error="errors.symbol"
              required
            />
            <Select
              v-model="form.market"
              label="Market"
              :options="['Forex', 'Crypto', 'Stock', 'Futures']"
              placeholder="Select market"
              required
            />
            <Select
              v-model="form.direction"
              label="Direction"
              :options="['Long', 'Short']"
              placeholder="Select direction"
              :error="errors.direction"
              required
            />
            <Select
              v-model="form.timeframe"
              label="Timeframe"
              :options="['1m','5m','15m','30m','1h','4h','1D','1W']"
              placeholder="Select TF"
            />
            <div class="col-span-2">
              <Select
                v-model="form.setup"
                label="Setup"
                :options="settingsStore.settings.setups"
                placeholder="Select setup"
              />
            </div>
          </div>
        </Card>

        <!-- PRICES -->
        <Card>
          <h2 class="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
            <DollarSign :size="15" /> Prices & Size
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Input
              v-model="form.entry_price"
              label="Entry Price"
              type="number"
              step="any"
              :error="errors.entry_price"
              required
            />
            <Input
              v-model="form.stop_loss"
              label="Stop Loss"
              type="number"
              step="any"
            />
            <Input
              v-model="form.take_profit"
              label="Take Profit"
              type="number"
              step="any"
            />
            <Input
              v-model="form.exit_price"
              label="Exit Price"
              type="number"
              step="any"
              :error="errors.exit_price"
              required
            />
            <Input
              v-model="form.position_size"
              label="Position Size"
              type="number"
              step="any"
              hint="Lots / Units"
              :error="errors.position_size"
              required
            />
            <Input
              v-model="form.fees"
              label="Fees"
              type="number"
              step="any"
              hint="Commissions + swap"
            />
          </div>
          <div class="mt-4">
            <Input
              v-model="form.account_balance"
              label="Account Balance (before trade)"
              type="number"
              step="any"
              hint="Balance before this trade opened"
            />
          </div>

          <!-- SL direction warning -->
          <div v-if="slWarning" class="mt-3 flex items-center gap-2 text-yellow-400 text-xs bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2">
            <AlertTriangle :size="13" />
            {{ slWarning }}
          </div>
        </Card>

        <!-- AUTO-CALCULATED PREVIEW -->
        <Card class="bg-neutral-800/50">
          <h2 class="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
            <Calculator :size="15" /> Auto-Calculated Preview
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p class="text-xs text-neutral-500 uppercase tracking-wide">Risk</p>
              <p class="text-lg font-bold font-mono" :class="preview.risk > 0 ? 'text-yellow-400' : 'text-neutral-400'">
                ${{ preview.risk.toFixed(2) }}
              </p>
            </div>
            <div>
              <p class="text-xs text-neutral-500 uppercase tracking-wide">P&L</p>
              <p class="text-lg font-bold font-mono" :class="pnlClass(preview.pnl)">
                {{ formatPnl(preview.pnl) }}
              </p>
            </div>
            <div>
              <p class="text-xs text-neutral-500 uppercase tracking-wide">R-Multiple</p>
              <p class="text-lg font-bold font-mono" :class="preview.r >= 0 ? 'text-profit-400' : 'text-loss-400'">
                {{ preview.r.toFixed(2) }}R
              </p>
            </div>
            <div>
              <p class="text-xs text-neutral-500 uppercase tracking-wide">Result</p>
              <Badge :label="preview.result" type="result" />
            </div>
          </div>
        </Card>

        <!-- PSYCHOLOGY -->
        <Card>
          <h2 class="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
            <Brain :size="15" /> Psychology
          </h2>
          <div class="grid grid-cols-2 gap-4">
            <Select
              v-model="form.emotion"
              label="Emotion"
              :options="['Calm','Fear','Greed','FOMO','Revenge','Confident']"
              placeholder="How did you feel?"
            />
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-neutral-400 uppercase tracking-wide">Followed Plan?</label>
              <div class="flex items-center gap-3 mt-1">
                <Toggle v-model="form.followed_plan" />
                <span class="text-sm" :class="form.followed_plan ? 'text-profit-400' : 'text-neutral-400'">
                  {{ form.followed_plan ? 'Yes' : 'No' }}
                </span>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <MultiSelect
              v-model="form.mistake_tags"
              label="Mistake Tags"
              :options="settingsStore.settings.mistake_tags"
            />
          </div>
        </Card>

        <!-- NOTES & SCREENSHOT -->
        <Card>
          <h2 class="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
            <FileText :size="15" /> Notes & Screenshot
          </h2>
          <div class="flex flex-col gap-1 mb-4">
            <label class="text-xs font-medium text-neutral-400 uppercase tracking-wide">Notes</label>
            <textarea
              v-model="form.notes"
              rows="4"
              class="input-base resize-none"
              placeholder="Why did you take this trade? What did you learn?"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-neutral-400 uppercase tracking-wide">Screenshot URL</label>
            <input
              v-model="form.screenshot_url"
              type="url"
              class="input-base"
              placeholder="https://drive.google.com/... or TradingView link"
            />
            <!-- Preview -->
            <div v-if="validScreenshot" class="mt-2">
              <img
                :src="form.screenshot_url"
                alt="Trade chart screenshot"
                class="rounded-lg border border-neutral-700 max-h-48 object-cover"
                @error="screenshotError = true"
              />
            </div>
          </div>
        </Card>

        <!-- Actions -->
        <div class="flex gap-3 justify-end pb-4">
          <router-link to="/trades" class="btn-ghost text-sm">Cancel</router-link>
          <button
            type="submit"
            :disabled="submitting"
            class="btn-primary text-sm flex items-center gap-2"
          >
            <Spinner v-if="submitting" size="sm" />
            {{ isEdit ? 'Update Trade' : 'Save Trade' }}
          </button>
        </div>
      </form>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, Clock, TrendingUp, DollarSign, Brain, FileText,
  AlertTriangle, Calculator,
} from '@lucide/vue'
import Layout from '../components/layout/Layout.vue'
import Card from '../components/ui/Card.vue'
import Input from '../components/ui/Input.vue'
import Select from '../components/ui/Select.vue'
import Badge from '../components/ui/Badge.vue'
import Toggle from '../components/ui/Toggle.vue'
import MultiSelect from '../components/ui/MultiSelect.vue'
import Spinner from '../components/ui/Spinner.vue'
import { useTradesStore } from '../stores/trades'
import { useSettingsStore } from '../stores/settings'
import { calcRisk, calcPnl, calcRMultiple, calcResult } from '../lib/calculations'
import type { TradeFormData, TradeResult } from '../types'
import { format } from 'date-fns'

const route = useRoute()
const router = useRouter()
const tradesStore = useTradesStore()
const settingsStore = useSettingsStore()

const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)
const screenshotError = ref(false)

// ─── Form state ───────────────────────────────────────────────────
const defaultForm = (): TradeFormData => ({
  date_open: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  date_close: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  symbol: '',
  market: 'Forex',
  direction: 'Long',
  setup: '',
  timeframe: '1h',
  entry_price: 0,
  stop_loss: 0,
  take_profit: 0,
  exit_price: 0,
  position_size: 0,
  fees: 0,
  account_balance: settingsStore.settings.starting_balance,
  risk_amount: 0,
  pnl: 0,
  r_multiple: 0,
  result: 'Breakeven',
  emotion: 'Calm',
  followed_plan: true,
  mistake_tags: [],
  notes: '',
  screenshot_url: '',
})

const form = ref<TradeFormData>(defaultForm())
const errors = ref<Partial<Record<keyof TradeFormData, string>>>({})

// ─── Live preview ─────────────────────────────────────────────────
const preview = computed(() => {
  const risk = calcRisk(
    Number(form.value.entry_price),
    Number(form.value.stop_loss),
    Number(form.value.position_size),
    form.value.direction,
  )
  const pnl = calcPnl(
    Number(form.value.exit_price),
    Number(form.value.entry_price),
    Number(form.value.position_size),
    form.value.direction,
    Number(form.value.fees),
  )
  const r = calcRMultiple(pnl, risk)
  const result: TradeResult = calcResult(pnl)
  return { risk, pnl, r, result }
})

// SL direction consistency warning
const slWarning = computed(() => {
  const sl = Number(form.value.stop_loss)
  const entry = Number(form.value.entry_price)
  if (!sl || !entry) return ''
  if (form.value.direction === 'Long' && sl >= entry) {
    return 'Long trade: Stop Loss should be below Entry Price.'
  }
  if (form.value.direction === 'Short' && sl <= entry) {
    return 'Short trade: Stop Loss should be above Entry Price.'
  }
  return ''
})

const validScreenshot = computed(() => {
  const url = form.value.screenshot_url
  if (!url || screenshotError.value) return false
  try { new URL(url); return true }
  catch { return false }
})

watch(() => form.value.screenshot_url, () => { screenshotError.value = false })

// ─── Load for edit ────────────────────────────────────────────────
onMounted(async () => {
  await settingsStore.fetchSettings()
  if (isEdit.value) {
    // Ensure trades are loaded
    if (!tradesStore.trades.length) await tradesStore.fetchTrades()
    const id = route.params.id as string
    const trade = tradesStore.trades.find(t => t.trade_id === id)
    if (trade) {
      form.value = {
        date_open: trade.date_open?.slice(0, 16) ?? '',
        date_close: trade.date_close?.slice(0, 16) ?? '',
        symbol: trade.symbol,
        market: trade.market,
        direction: trade.direction,
        setup: trade.setup ?? '',
        timeframe: trade.timeframe ?? '1h',
        entry_price: trade.entry_price,
        stop_loss: trade.stop_loss,
        take_profit: trade.take_profit,
        exit_price: trade.exit_price,
        position_size: trade.position_size,
        fees: trade.fees ?? 0,
        account_balance: trade.account_balance,
        risk_amount: trade.risk_amount,
        pnl: trade.pnl,
        r_multiple: trade.r_multiple,
        result: trade.result,
        emotion: trade.emotion ?? 'Calm',
        followed_plan: trade.followed_plan,
        mistake_tags: trade.mistake_tags ?? [],
        notes: trade.notes ?? '',
        screenshot_url: trade.screenshot_url ?? '',
      }
    }
  }
})

// ─── Validation ───────────────────────────────────────────────────
function validate(): boolean {
  const e: typeof errors.value = {}
  if (!form.value.date_open) e.date_open = 'Required'
  if (!form.value.date_close) e.date_close = 'Required'
  if (!form.value.symbol) e.symbol = 'Required'
  if (!form.value.direction) e.direction = 'Required'
  if (!Number(form.value.entry_price)) e.entry_price = 'Enter a valid price'
  if (!Number(form.value.exit_price)) e.exit_price = 'Enter a valid price'
  if (!Number(form.value.position_size)) e.position_size = 'Enter position size'
  errors.value = e
  return Object.keys(e).length === 0
}

// ─── Submit ───────────────────────────────────────────────────────
async function handleSubmit() {
  if (!validate()) return
  submitting.value = true

  try {
    if (isEdit.value) {
      const id = route.params.id as string
      const res = await tradesStore.updateTrade(id, form.value)
      if (res.success) {
        router.push('/trades')
      }
    } else {
      const res = await tradesStore.addTrade(form.value)
      if (res.success || res.error) {
        // Even if queued, navigate away
        router.push('/trades')
      }
    }
  } finally {
    submitting.value = false
  }
}

// ─── Helpers ──────────────────────────────────────────────────────
function formatPnl(pnl: number) {
  if (!pnl) return '$0.00'
  const abs = Math.abs(pnl).toFixed(2)
  return (pnl >= 0 ? '+$' : '-$') + abs
}

function pnlClass(pnl: number) {
  if (pnl > 0) return 'pnl-positive'
  if (pnl < 0) return 'pnl-negative'
  return 'pnl-zero'
}
</script>
