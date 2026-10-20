<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <component :is="resolvedIcon" :size="48" class="text-neutral-700 mb-4" />
    <h3 class="text-base font-semibold text-neutral-400">{{ message }}</h3>
    <p v-if="sub" class="text-sm text-neutral-500 mt-1 max-w-xs">{{ sub }}</p>
    <slot class="mt-4" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as LucideIcons from '@lucide/vue'

const props = withDefaults(defineProps<{
  icon?: string
  message: string
  sub?: string
}>(), { icon: 'FileText' })

const resolvedIcon = computed(() => {
  return (LucideIcons as Record<string, unknown>)[props.icon ?? 'FileText']
})
</script>
