<template>
  <div
    v-if="queueCount > 0"
    class="flex items-center justify-between gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 mb-4"
  >
    <div class="flex items-center gap-2">
      <WifiOff :size="16" class="text-yellow-400" />
      <span class="text-sm text-yellow-300">
        <strong>{{ queueCount }} unsynced trade{{ queueCount !== 1 ? 's' : '' }}</strong> saved locally.
      </span>
    </div>
    <button
      @click="sync"
      :disabled="syncing"
      class="btn-primary text-xs py-1 px-3"
    >
      <Spinner v-if="syncing" size="sm" />
      <span v-else>Sync now</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { WifiOff } from '@lucide/vue'
import { getQueue, syncQueue } from '../lib/queue'
import Spinner from './ui/Spinner.vue'
import { useTradesStore } from '../stores/trades'

const syncing = ref(false)
const tradesStore = useTradesStore()

const queueCount = computed(() => getQueue().length)

async function sync() {
  syncing.value = true
  const { synced } = await syncQueue()
  if (synced > 0) {
    await tradesStore.fetchTrades()
  }
  syncing.value = false
}
</script>
