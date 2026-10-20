<template>
  <Layout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Dashboard</h1>
          <p class="text-sm text-neutral-400 mt-1">Your trading performance at a glance</p>
        </div>
        <div class="flex gap-2">
          <select
            v-model="selectedPeriod"
            class="input-base !w-auto text-sm"
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="tradesStore.loading" class="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>

      <template v-else>
        <!-- Stat Cards Row 1 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total P&L" :value="stats.totalPnl" format="currency" :colorize="true" />
          <StatCard label="Win Rate" :value="stats.winRate" format="percent" />
          <StatCard label="Profit Factor" :value="stats.profitFactor" format="number" />
          <StatCard label="Expectancy" :value="stats.expectancy" format="currency" :colorize="true" sub="per trade" />
        </div>

        <!-- Stat Cards Row 2 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Avg R" :value="stats.avgR" format="number" :colorize="true" />
          <StatCard label="Max Drawdown" :value="stats.maxDrawdown" format="currency" sub="peak to trough" />
          <StatCard label="Best Trade" :value="stats.bestTrade" format="currency" :colorize="true" />
          <StatCard label="Worst Trade" :value="stats.worstTrade" format="currency" :colorize="true" />
        </div>

        <!-- Trade Summary Row -->
        <div class="grid grid-cols-3 gap-4">
          <Card class="text-center">
            <p class="text-xs text-neutral-400 uppercase tracking-wide">Total Trades</p>
            <p class="text-3xl font-bold text-white mt-2">{{ stats.totalTrades }}</p>
          </Card>
          <Card class="text-center">
            <p class="text-xs text-neutral-400 uppercase tracking-wide">Wins</p>
            <p class="text-3xl font-bold text-profit-400 mt-2">{{ stats.wins }}</p>
          </Card>
          <Card class="text-center">
            <p class="text-xs text-neutral-400 uppercase tracking-wide">Losses</p>
            <p class="text-3xl font-bold text-loss-400 mt-2">{{ stats.losses }}</p>
          </Card>
        </div>

        <!-- Equity Curve -->
        <Card>
          <h2 class="text-sm font-semibold text-neutral-300 mb-4">Equity Curve</h2>
          <div v-if="equityData.labels.length > 1" class="h-56">
            <Line :data="equityData" :options="lineOptions" />
          </div>
          <EmptyState v-else icon="TrendingUp" message="No trade data yet" sub="Add your first trade to see the equity curve." />
        </Card>

        <!-- Charts Row -->
        <div class="grid md:grid-cols-2 gap-4">
          <!-- P&L by Day of Week -->
          <Card>
            <h2 class="text-sm font-semibold text-neutral-300 mb-4">P&amp;L by Day of Week</h2>
            <div v-if="filteredTrades.length" class="h-48">
              <Bar :data="dowData" :options="barOptions" />
            </div>
            <EmptyState v-else icon="BarChart2" message="No data" />
          </Card>

          <!-- P&L by Symbol -->
          <Card>
            <h2 class="text-sm font-semibold text-neutral-300 mb-4">P&amp;L by Symbol</h2>
            <div v-if="filteredTrades.length" class="h-48">
              <Bar :data="symbolData" :options="barOptions" />
            </div>
            <EmptyState v-else icon="BarChart2" message="No data" />
          </Card>
        </div>

        <!-- P&L by Setup + Discipline -->
        <div class="grid md:grid-cols-2 gap-4">
          <!-- P&L by Setup -->
          <Card>
            <h2 class="text-sm font-semibold text-neutral-300 mb-4">P&amp;L by Setup</h2>
            <div v-if="filteredTrades.length" class="h-48">
              <Bar :data="setupData" :options="barOptions" />
            </div>
            <EmptyState v-else icon="BarChart2" message="No data" />
          </Card>

          <!-- Emotion breakdown -->
          <Card>
            <h2 class="text-sm font-semibold text-neutral-300 mb-4">Emotions</h2>
            <div v-if="filteredTrades.length" class="h-48">
              <Doughnut :data="emotionData" :options="doughnutOptions" />
            </div>
            <EmptyState v-else icon="PieChart" message="No data" />
          </Card>
        </div>

        <!-- Discipline Tracker -->
        <Card>
          <h2 class="text-sm font-semibold text-neutral-300 mb-4">Discipline Tracker</h2>
          <div class="grid md:grid-cols-3 gap-6">
            <!-- Followed Plan -->
            <div>
              <p class="text-xs text-neutral-400 uppercase tracking-wide mb-2">Followed Plan</p>
              <div class="flex items-center gap-3">
                <div class="flex-1 bg-neutral-700 rounded-full h-3 overflow-hidden">
                  <div
                    class="h-full bg-profit-500 rounded-full transition-all"
                    :style="{ width: stats.followedPlanPct + '%' }"
                  />
                </div>
                <span class="text-sm font-mono font-bold text-profit-400">{{ stats.followedPlanPct.toFixed(0) }}%</span>
              </div>
              <p class="text-xs text-neutral-500 mt-1">{{ stats.followedPlanCount }} / {{ stats.totalTrades }} trades</p>
            </div>

            <!-- Top Emotion -->
            <div>
              <p class="text-xs text-neutral-400 uppercase tracking-wide mb-2">Most Common Emotion</p>
              <p class="text-lg font-semibold text-white">{{ stats.topEmotion || '—' }}</p>
              <p class="text-xs text-neutral-500 mt-1">appears most in your trades</p>
            </div>

            <!-- Top Mistake -->
            <div>
              <p class="text-xs text-neutral-400 uppercase tracking-wide mb-2">Most Frequent Mistake</p>
              <p class="text-lg font-semibold text-loss-400">{{ stats.topMistake || '—' }}</p>
              <p class="text-xs text-neutral-500 mt-1">costing you money</p>
            </div>
          </div>

          <!-- Mistake breakdown bar -->
          <div v-if="mistakesData.labels.length" class="mt-6 h-36">
            <Bar :data="mistakesData" :options="barOptions" />
          </div>
        </Card>

        <!-- Empty state for whole dashboard -->
        <div v-if="!filteredTrades.length && !tradesStore.loading" class="text-center py-10">
          <p class="text-neutral-500 text-sm">Start by adding your first trade.</p>
          <router-link to="/trades/new" class="mt-3 inline-flex btn-primary text-sm px-4 py-2 rounded-lg">
            Add Trade
          </router-link>
        </div>
      </template>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import Layout from '../components/layout/Layout.vue'
import Card from '../components/ui/Card.vue'
import StatCard from '../components/ui/StatCard.vue'
import Spinner from '../components/ui/Spinner.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { useTradesStore } from '../stores/trades'
import { useSettingsStore } from '../stores/settings'
import {
  buildDashboardStats,
  buildEquityCurve,
  groupByDayOfWeek,
  groupBySymbol,
  groupBySetup,
  groupByEmotion,
  groupByMistakeTag,
} from '../lib/calculations'
import { subDays } from 'date-fns'

Chart.register(...registerables)

const tradesStore = useTradesStore()
const settingsStore = useSettingsStore()

const selectedPeriod = ref<string>('all')

const filteredTrades = computed(() => {
  const trades = tradesStore.sortedTrades
  if (selectedPeriod.value === 'all') return trades
  const days = parseInt(selectedPeriod.value)
  const cutoff = subDays(new Date(), days)
  return trades.filter(t => new Date(t.date_close) >= cutoff)
})

const stats = computed(() => buildDashboardStats(filteredTrades.value))

// ─── Chart data ───────────────────────────────────────────────────

const chartColors = {
  profit: 'rgba(34, 197, 94, 0.8)',
  loss: 'rgba(239, 68, 68, 0.8)',
  blue: 'rgba(59, 130, 246, 0.8)',
  neutral: 'rgba(115, 115, 115, 0.5)',
}

function pnlColor(val: number) {
  return val >= 0 ? chartColors.profit : chartColors.loss
}

const equityData = computed(() => {
  const curve = buildEquityCurve(
    filteredTrades.value,
    settingsStore.settings.starting_balance
  )
  return {
    labels: curve.map(p => p.date),
    datasets: [{
      label: 'Equity',
      data: curve.map(p => p.equity),
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 2,
    }],
  }
})

const dowData = computed(() => {
  const groups = groupByDayOfWeek(filteredTrades.value)
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const values = labels.map((_, i) => groups[i + 1] ?? 0)
  return {
    labels,
    datasets: [{
      label: 'P&L',
      data: values,
      backgroundColor: values.map(pnlColor),
    }],
  }
})

const symbolData = computed(() => {
  const groups = groupBySymbol(filteredTrades.value)
  const labels = Object.keys(groups)
  const values = labels.map(k => groups[k])
  return {
    labels,
    datasets: [{
      label: 'P&L',
      data: values,
      backgroundColor: values.map(pnlColor),
    }],
  }
})

const setupData = computed(() => {
  const groups = groupBySetup(filteredTrades.value)
  const labels = Object.keys(groups)
  const values = labels.map(k => groups[k])
  return {
    labels,
    datasets: [{
      label: 'P&L',
      data: values,
      backgroundColor: values.map(pnlColor),
    }],
  }
})

const emotionData = computed(() => {
  const groups = groupByEmotion(filteredTrades.value)
  const labels = Object.keys(groups)
  const values = labels.map(k => groups[k])
  const colors = ['#3b82f6','#22c55e','#eab308','#f97316','#a855f7','#ef4444']
  return {
    labels,
    datasets: [{
      data: values,
      backgroundColor: colors.slice(0, labels.length),
      borderWidth: 0,
    }],
  }
})

const mistakesData = computed(() => {
  const groups = groupByMistakeTag(filteredTrades.value)
  const labels = Object.keys(groups)
  const values = labels.map(k => groups[k])
  return {
    labels,
    datasets: [{
      label: 'Count',
      data: values,
      backgroundColor: chartColors.loss,
    }],
  }
})

// ─── Chart options ────────────────────────────────────────────────

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1a202c',
      titleColor: '#a3a3a3',
      bodyColor: '#ffffff',
    },
  },
  scales: {
    x: {
      ticks: { color: '#737373', font: { size: 11 } },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
    y: {
      ticks: { color: '#737373', font: { size: 11 } },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
  },
}

const lineOptions = {
  ...commonOptions,
  plugins: {
    ...commonOptions.plugins,
    legend: { display: false },
  },
}

const barOptions = { ...commonOptions }

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'right' as const,
      labels: { color: '#a3a3a3', font: { size: 11 }, boxWidth: 12, padding: 8 },
    },
    tooltip: {
      backgroundColor: '#1a202c',
      titleColor: '#a3a3a3',
      bodyColor: '#ffffff',
    },
  },
}

onMounted(async () => {
  await tradesStore.fetchTrades()
  await settingsStore.fetchSettings()
})
</script>
