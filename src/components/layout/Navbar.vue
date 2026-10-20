<template>
  <header class="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 md:px-6 shrink-0">
    <!-- Page title (mobile: show TTJ logo) -->
    <div class="flex items-center gap-2">
      <span class="md:hidden text-lg font-black tracking-tight">TTJ</span>
      <h1 class="hidden md:block text-sm font-medium text-neutral-300">{{ pageTitle }}</h1>
    </div>

    <!-- Right side actions -->
    <div class="flex items-center gap-2">
      <!-- Dark mode toggle -->
      <button
        @click="$emit('toggle-dark')"
        class="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        <Sun v-if="isDark" :size="18" />
        <Moon v-else :size="18" />
      </button>

      <!-- GAS status dot -->
      <div
        class="w-2 h-2 rounded-full"
        :class="gasOk === null ? 'bg-neutral-500' : gasOk ? 'bg-profit-500' : 'bg-loss-500'"
        :title="gasOk === null ? 'Connecting...' : gasOk ? 'Google Sheets connected' : 'Google Sheets disconnected'"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Sun, Moon } from '@lucide/vue'
import { pingGAS } from '../../lib/gas'

defineProps<{ isDark: boolean }>()
defineEmits<{ (e: 'toggle-dark'): void }>()

const route = useRoute()
const gasOk = ref<boolean | null>(null)

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/trades': 'All Trades',
  '/trades/new': 'Add Trade',
  '/calendar': 'Calendar',
  '/daily-review': 'Daily Review',
  '/settings': 'Settings',
}

const pageTitle = computed(() => {
  if (route.path.includes('/edit')) return 'Edit Trade'
  return PAGE_TITLES[route.path] || 'TTJ'
})

onMounted(async () => {
  gasOk.value = await pingGAS()
})
</script>
