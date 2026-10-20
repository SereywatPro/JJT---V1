<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 z-50">
    <div class="flex items-center justify-around py-2">
      <MobileNavItem v-for="link in links" :key="link.to" v-bind="link" />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { LayoutDashboard, PlusCircle, List, CalendarDays, BookOpen } from '@lucide/vue'
import MobileNavItem from './MobileNavItem.vue'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/trades', label: 'Trades', icon: List },
  { to: '/trades/new', label: 'Add', icon: PlusCircle },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/daily-review', label: 'Review', icon: BookOpen },
]
</script>
