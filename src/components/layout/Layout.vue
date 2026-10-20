<template>
  <div class="flex h-screen overflow-hidden bg-neutral-950 text-white" :class="{ light: !isDark }">
    <!-- Sidebar (desktop) -->
    <Sidebar :is-dark="isDark" />

    <!-- Main content area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top navbar -->
      <Navbar :is-dark="isDark" @toggle-dark="toggleDark" />

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-4 md:p-6">
        <!-- Risk Guard banner -->
        <RiskGuard />

        <!-- Offline queue banner -->
        <QueueBanner />

        <!-- Actual Page Content via Slot -->
        <slot />
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <MobileNav />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
import MobileNav from './MobileNav.vue'
import RiskGuard from '../RiskGuard.vue'
import QueueBanner from '../QueueBanner.vue'

const DARK_KEY = 'ttj_dark_mode'

const isDark = ref(true)

function toggleDark() {
  isDark.value = !isDark.value
  localStorage.setItem(DARK_KEY, isDark.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', isDark.value)
}

onMounted(() => {
  const saved = localStorage.getItem(DARK_KEY)
  if (saved) {
    isDark.value = saved === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  document.documentElement.classList.toggle('dark', isDark.value)
})

provide('isDark', isDark)
</script>
