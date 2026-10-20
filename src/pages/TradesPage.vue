<template>
  <Layout>
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-white">Trades</h1>
          <p class="text-sm text-neutral-400 mt-1">{{ filteredTrades.length }} trades</p>
        </div>
        <div class="flex gap-2">
          <!-- Export dropdown -->
          <div class="relative" ref="exportRef">
            <button @click="showExport = !showExport" class="btn-ghost text-sm flex items-center gap-2">
              <Download :size="15" /> Export
            </button>
            <div
              v-if="showExport"
              class="absolute right-0 top-full mt-1 w-44 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-10 py-1"
            >
              <button @click="doExportCSV" class="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white">
                Download CSV
              </button>
              <button @click="doExportXLSX" class="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white">
                Download XLSX
              </button>
            </div>
          </div>
          <router-link to="/trades/new" class="btn-primary text-sm flex items-center gap-2">
            <Plus :size="15" /> Add Trade
          </router-link>
        </div>
      </div>

      <!-- Filters -->
      <Card class="!p-3">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <!-- Search -->
          <div class="col-span-2 sm:col-span-3 lg:col-span-2">
            <div class="relative">
              <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                v-model="search"
                placeholder="Search symbol, setup, notes…"
                class="input-base pl-8 !text-xs"
              />
            </div>
          </div>

          <!-- Symbol filter -->
          <select v-model="filterSymbol" class="input-base !text-xs">
            <option value="">All Symbols</option>
            <option v-for="s in settingsStore.settings.symbols" :key="s" :value="s">{{ s }}</option>
          </select>

          <!-- Result filter -->
          <select v-model="filterResult" class="input-base !text-xs">
            <option value="">All Results</option>
            <option value="Win">Win</option>
            <option value="Loss">Loss</option>
            <option value="Breakeven">Breakeven</option>
          </select>

          <!-- Direction filter -->
          <select v-model="filterDirection" class="input-base !text-xs">
            <option value="">All Directions</option>
            <option value="Long">Long</option>
            <option value="Short">Short</option>
          </select>

          <!-- Clear -->
          <button @click="clearFilters" class="btn-ghost !text-xs flex items-center justify-center gap-1">
            <X :size="13" /> Clear
          </button>
        </div>
      </Card>

      <!-- Loading -->
      <div v-if="tradesStore.loading" class="flex justify-center py-16">
        <Spinner size="lg" />
      </div>

      <!-- Empty -->
      <EmptyState
        v-else-if="!filteredTrades.length"
        icon="BookOpen"
        message="No trades found"
        sub="Try adjusting your filters or add a new trade."
      />

      <!-- Table -->
      <Card v-else class="!p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-neutral-800 text-xs text-neutral-400 uppercase tracking-wide">
                <th
                  v-for="col in columns"
                  :key="col.key"
                  class="px-4 py-3 text-left font-medium cursor-pointer select-none hover:text-white transition-colors"
                  @click="setSort(col.key)"
                >
                  <span class="flex items-center gap-1">
                    {{ col.label }}
                    <ArrowUpDown v-if="sortKey !== col.key" :size="11" class="opacity-40" />
                    <ArrowUp v-else-if="sortDir === 'asc'" :size="11" />
                    <ArrowDown v-else :size="11" />
                  </span>
                </th>
                <th class="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="trade in paginatedTrades"
                :key="trade.trade_id"
                class="border-b border-neutral-800/60 hover:bg-neutral-800/40 transition-colors"
              >
                <td class="px-4 py-3 font-mono text-xs text-neutral-400">
                  {{ formatDate(trade.date_close) }}
                </td>
                <td class="px-4 py-3 font-semibold text-white">{{ trade.symbol }}</td>
                <td class="px-4 py-3">
                  <Badge :label="trade.direction" type="direction" />
                </td>
                <td class="px-4 py-3 text-neutral-300 text-xs">{{ trade.setup || '—' }}</td>
                <td class="px-4 py-3 font-mono text-xs text-neutral-400">{{ trade.entry_price }}</td>
                <td class="px-4 py-3 font-mono text-xs text-neutral-400">{{ trade.exit_price }}</td>
                <td class="px-4 py-3 font-mono text-sm font-semibold" :class="pnlClass(trade.pnl)">
                  {{ formatPnl(trade.pnl) }}
                </td>
                <td class="px-4 py-3 font-mono text-xs" :class="trade.r_multiple >= 0 ? 'text-profit-400' : 'text-loss-400'">
                  {{ trade.r_multiple?.toFixed(2) }}R
                </td>
                <td class="px-4 py-3">
                  <Badge :label="trade.result" type="result" />
                </td>
                <td class="px-4 py-3">
                  <Badge :label="trade.emotion" type="emotion" />
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <router-link
                      :to="`/trades/${trade.trade_id}/edit`"
                      class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                      title="Edit"
                    >
                      <Pencil :size="13" />
                    </router-link>
                    <button
                      @click="confirmDelete(trade.trade_id)"
                      class="p-1.5 rounded-lg text-neutral-400 hover:text-loss-400 hover:bg-neutral-700 transition-colors"
                      title="Delete"
                    >
                      <Trash2 :size="13" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-neutral-800 text-xs text-neutral-400">
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <div class="flex gap-1">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-2 py-1 rounded hover:bg-neutral-800 disabled:opacity-40 transition-colors"
            >Prev</button>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-2 py-1 rounded hover:bg-neutral-800 disabled:opacity-40 transition-colors"
            >Next</button>
          </div>
        </div>
      </Card>

      <!-- Delete Confirm Modal -->
      <Modal :open="!!deleteId" @close="deleteId = null">
        <h3 class="text-lg font-bold text-white">Delete Trade?</h3>
        <p class="text-neutral-400 text-sm mt-2">This will permanently remove the trade from Google Sheets. This cannot be undone.</p>
        <div class="flex gap-3 mt-6 justify-end">
          <button @click="deleteId = null" class="btn-ghost text-sm">Cancel</button>
          <button @click="doDelete" :disabled="deleting" class="btn-danger text-sm flex items-center gap-2">
            <Spinner v-if="deleting" size="sm" />
            Delete
          </button>
        </div>
      </Modal>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { format } from 'date-fns'
import {
  Download, Plus, Search, X, Pencil, Trash2,
  ArrowUpDown, ArrowUp, ArrowDown,
} from '@lucide/vue'
import Layout from '../components/layout/Layout.vue'
import Card from '../components/ui/Card.vue'
import Badge from '../components/ui/Badge.vue'
import Modal from '../components/ui/Modal.vue'
import Spinner from '../components/ui/Spinner.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { useTradesStore } from '../stores/trades'
import { useSettingsStore } from '../stores/settings'
import { exportToCSV, exportToXLSX } from '../lib/export'
import type { Trade } from '../types'

const tradesStore = useTradesStore()
const settingsStore = useSettingsStore()

// ─── Filters ───────────────────────────────────────────────────────
const search = ref('')
const filterSymbol = ref('')
const filterResult = ref('')
const filterDirection = ref('')

function clearFilters() {
  search.value = ''
  filterSymbol.value = ''
  filterResult.value = ''
  filterDirection.value = ''
}

// ─── Sorting ───────────────────────────────────────────────────────
const sortKey = ref<keyof Trade>('date_close')
const sortDir = ref<'asc' | 'desc'>('desc')

const columns = [
  { key: 'date_close', label: 'Date' },
  { key: 'symbol', label: 'Symbol' },
  { key: 'direction', label: 'Dir.' },
  { key: 'setup', label: 'Setup' },
  { key: 'entry_price', label: 'Entry' },
  { key: 'exit_price', label: 'Exit' },
  { key: 'pnl', label: 'P&L' },
  { key: 'r_multiple', label: 'R' },
  { key: 'result', label: 'Result' },
  { key: 'emotion', label: 'Emotion' },
] as const

function setSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key as keyof Trade
    sortDir.value = 'desc'
  }
}

// ─── Filtered + sorted ────────────────────────────────────────────
const filteredTrades = computed(() => {
  return tradesStore.sortedTrades
    .filter(t => {
      if (filterSymbol.value && t.symbol !== filterSymbol.value) return false
      if (filterResult.value && t.result !== filterResult.value) return false
      if (filterDirection.value && t.direction !== filterDirection.value) return false
      if (search.value) {
        const q = search.value.toLowerCase()
        return (
          t.symbol?.toLowerCase().includes(q) ||
          t.setup?.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => {
      const av = a[sortKey.value]
      const bv = b[sortKey.value]
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir.value === 'asc' ? cmp : -cmp
    })
})

// Reset page when filters change
watch([search, filterSymbol, filterResult, filterDirection], () => { currentPage.value = 1 })

// ─── Pagination ────────────────────────────────────────────────────
const PAGE_SIZE = 25
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(filteredTrades.value.length / PAGE_SIZE))
const paginatedTrades = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredTrades.value.slice(start, start + PAGE_SIZE)
})

// ─── Export ────────────────────────────────────────────────────────
const showExport = ref(false)
const exportRef = ref<HTMLElement | null>(null)

function doExportCSV() {
  exportToCSV(filteredTrades.value)
  showExport.value = false
}
function doExportXLSX() {
  exportToXLSX(filteredTrades.value)
  showExport.value = false
}

function onClickOutside(e: MouseEvent) {
  if (exportRef.value && !exportRef.value.contains(e.target as Node)) {
    showExport.value = false
  }
}
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

// ─── Delete ────────────────────────────────────────────────────────
const deleteId = ref<string | null>(null)
const deleting = ref(false)

function confirmDelete(id: string) {
  deleteId.value = id
}

async function doDelete() {
  if (!deleteId.value) return
  deleting.value = true
  await tradesStore.deleteTrade(deleteId.value)
  deleting.value = false
  deleteId.value = null
}

// ─── Helpers ───────────────────────────────────────────────────────
function formatDate(d: string) {
  try { return format(new Date(d), 'MM/dd/yy') }
  catch { return d }
}

function formatPnl(pnl: number) {
  if (pnl == null) return '—'
  const abs = Math.abs(pnl).toFixed(2)
  return (pnl >= 0 ? '+$' : '-$') + abs
}

function pnlClass(pnl: number) {
  if (pnl > 0) return 'pnl-positive'
  if (pnl < 0) return 'pnl-negative'
  return 'pnl-zero'
}

onMounted(() => {
  tradesStore.fetchTrades()
})
</script>
