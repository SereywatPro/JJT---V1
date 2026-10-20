<template>
  <Layout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">Calendar</h2>
        <div class="flex items-center gap-2">
          <button @click="prevMonth" class="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
            <ChevronLeft :size="18" />
          </button>
          <span class="text-sm font-medium w-32 text-center">{{ monthLabel }}</span>
          <button @click="nextMonth" class="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
            <ChevronRight :size="18" />
          </button>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-4 text-xs text-neutral-400">
        <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded bg-profit-600" /> Profit</div>
        <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded bg-loss-600" /> Loss</div>
        <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded bg-neutral-700" /> No trades</div>
      </div>

      <!-- Calendar grid -->
      <div class="card p-4">
        <!-- Day headers -->
        <div class="grid grid-cols-7 mb-2">
          <div v-for="d in dayHeaders" :key="d" class="text-center text-xs font-medium text-neutral-500 py-1">{{ d }}</div>
        </div>
        <!-- Day cells -->
        <div class="grid grid-cols-7 gap-1">
          <div v-for="(cell, i) in calendarCells" :key="i">
            <button
              v-if="cell.day"
              @click="selectDay(cell.date!)"
              :class="[
                'w-full aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors cursor-pointer',
                cell.isToday ? 'ring-1 ring-blue-500' : '',
                cell.date === selectedDay ? 'ring-2 ring-white' : '',
                cell.pnl !== undefined
                  ? cell.pnl > 0
                    ? 'bg-profit-700/60 hover:bg-profit-600/60 text-profit-300'
                    : cell.pnl < 0
                      ? 'bg-loss-700/60 hover:bg-loss-600/60 text-loss-300'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                  : 'hover:bg-neutral-800 text-neutral-500',
              ]"
            >
              <span class="font-medium">{{ cell.day }}</span>
              <span v-if="cell.pnl !== undefined" class="text-[9px] mt-0.5 font-mono">
                {{ cell.pnl >= 0 ? '+' : '' }}{{ cell.pnl.toFixed(0) }}
              </span>
            </button>
            <div v-else class="aspect-square" />
          </div>
        </div>
      </div>

      <!-- Day detail panel -->
      <div v-if="selectedDay" class="card p-4 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold">{{ formatDay(selectedDay) }}</h3>
          <Badge v-if="dayPnl !== undefined" :label="(dayPnl >= 0 ? '+$' : '-$') + Math.abs(dayPnl).toFixed(2)" />
        </div>

        <div v-if="dayTrades.length === 0" class="text-sm text-neutral-500">No trades this day.</div>
        <div v-else class="space-y-2">
          <div
            v-for="t in dayTrades" :key="t.trade_id"
            class="flex items-center justify-between p-3 bg-neutral-800 rounded-lg"
          >
            <div>
              <span class="text-sm font-medium">{{ t.symbol }}</span>
              <Badge :label="t.direction" type="direction" class="ml-2" />
            </div>
            <span :class="t.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'">
              {{ t.pnl >= 0 ? '+' : '' }}${{ t.pnl.toFixed(2) }}
            </span>
          </div>
        </div>

        <router-link
          :to="`/daily-review?date=${selectedDay}`"
          class="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
        >
          <BookOpen :size="12" /> View / write daily review
        </router-link>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, BookOpen } from '@lucide/vue'
import Layout from '../components/layout/Layout.vue'
import Badge from '../components/ui/Badge.vue'
import { useTradesStore } from '../stores/trades'
import { pnlByDay } from '../lib/calculations'

const tradesStore = useTradesStore()
const currentMonth = ref(new Date())
const selectedDay = ref<string | null>(null)

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const monthLabel = computed(() => format(currentMonth.value, 'MMMM yyyy'))

const pnlMap = computed(() => pnlByDay(tradesStore.trades))

function prevMonth() {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() - 1)
  currentMonth.value = d
}
function nextMonth() {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() + 1)
  currentMonth.value = d
}

const calendarCells = computed(() => {
  const start = startOfMonth(currentMonth.value)
  const end = endOfMonth(currentMonth.value)
  const days = eachDayOfInterval({ start, end })
  const startDow = getDay(start)
  const cells: { day: number | null; date: string | null; pnl?: number; isToday: boolean }[] = []
  // Leading empties
  for (let i = 0; i < startDow; i++) cells.push({ day: null, date: null, isToday: false })
  for (const d of days) {
    const dateStr = format(d, 'yyyy-MM-dd')
    cells.push({
      day: d.getDate(),
      date: dateStr,
      pnl: pnlMap.value[dateStr],
      isToday: isToday(d),
    })
  }
  return cells
})

const dayTrades = computed(() =>
  selectedDay.value
    ? tradesStore.trades.filter(t => t.date_close?.slice(0, 10) === selectedDay.value)
    : []
)
const dayPnl = computed(() =>
  selectedDay.value ? pnlMap.value[selectedDay.value] : undefined
)

function selectDay(date: string) {
  selectedDay.value = selectedDay.value === date ? null : date
}
function formatDay(d: string) {
  return format(new Date(d), 'EEEE, MMMM d, yyyy')
}
</script>
