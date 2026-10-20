<template>
  <router-link
    :to="to"
    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
    :class="isActive
      ? 'bg-blue-600 text-white'
      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'"
  >
    <component :is="icon" :size="18" />
    <span>{{ label }}</span>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { Component } from 'vue'

const props = defineProps<{
  to: string
  label: string
  icon: Component
}>()

const route = useRoute()
const isActive = computed(() => route.path === props.to || route.path.startsWith(props.to + '/') && props.to !== '/')
</script>
