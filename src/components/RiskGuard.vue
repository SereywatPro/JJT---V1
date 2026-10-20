<template>
  <div class="space-y-2 mb-4">
    <div
      v-if="dailyLossBreached"
      class="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
    >
      <AlertOctagon :size="18" class="text-red-400 shrink-0" />
      <span class="text-sm text-red-300">
        <strong>Daily loss limit reached</strong> — Today's loss of
        <span class="font-mono">${{ Math.abs(todayPnl).toFixed(2) }}</span>
        exceeds your limit of
        <span class="font-mono">${{ settings.daily_loss_limit }}</span>.
        Consider stopping for today.
      </span>
    </div>
    <div
      v-if="maxTradesBreached"
      class="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3"
    >
      <AlertTriangle :size="18" class="text-yellow-400 shrink-0" />
      <span class="text-sm text-yellow-300">
        <strong>Max trades reached</strong> — You've taken {{ todayCount }} trade{{ todayCount !== 1 ? 's' : '' }} today
        (limit: {{ settings.max_trades_per_day }}).
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AlertOctagon, AlertTriangle } from '@lucide/vue'
import { useTradesStore } from '../stores/trades'
import { useSettingsStore } from '../stores/settings'

const tradesStore = useTradesStore()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const todayPnl = computed(() =>
  tradesStore.todayTrades.reduce((s: number, t: { pnl: number }) => s + t.pnl, 0)
)
const todayCount = computed(() => tradesStore.todayTrades.length)

const dailyLossBreached = computed(() =>
  todayPnl.value < 0 && Math.abs(todayPnl.value) >= settings.value.daily_loss_limit
)
const maxTradesBreached = computed(() =>
  todayCount.value >= settings.value.max_trades_per_day
)
</script>
