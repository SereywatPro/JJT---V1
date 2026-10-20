<template>
  <nav class="hidden md:flex flex-col w-64 bg-neutral-900 border-r border-neutral-800 shrink-0">
    <!-- Logo -->
    <div class="flex items-center gap-2 px-6 py-5 border-b border-neutral-800">
      <div class="flex items-center gap-1">
        <span class="text-2xl font-black tracking-tight text-white">TTJ</span>
        <span class="text-xs text-neutral-500 font-medium mt-1">JOURNAL</span>
      </div>
    </div>

    <!-- Nav links -->
    <nav class="flex-1 px-3 py-4 space-y-1">
      <SidebarLink v-for="link in links" :key="link.to" v-bind="link" />
    </nav>

    <!-- Bottom: Settings + logout -->
    <div class="px-3 py-4 border-t border-neutral-800 space-y-1">
      <SidebarLink to="/settings" label="Settings" :icon="Settings" />
      <button
        @click="logout"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
      >
        <LogOut :size="18" />
        <span>Log out</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { LayoutDashboard, List, PlusCircle, CalendarDays, BookOpen, Settings, LogOut } from '@lucide/vue'
import SidebarLink from './SidebarLink.vue'
import { logout as doLogout } from '../../lib/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

function logout() {
  doLogout()
  router.push('/login')
}

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/trades/new', label: 'Add Trade', icon: PlusCircle },
  { to: '/trades', label: 'Trades', icon: List },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/daily-review', label: 'Daily Review', icon: BookOpen },
]
</script>
