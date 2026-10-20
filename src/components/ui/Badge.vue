<template>
  <span :class="['inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border', classes]">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ label: string; type?: 'result' | 'emotion' | 'direction' | 'market' }>()

const classes = computed(() => {
  if (props.type === 'result') {
    return {
      Win: 'badge-win',
      Loss: 'badge-loss',
      Breakeven: 'badge-neutral',
    }[props.label] || 'badge-neutral'
  }
  if (props.type === 'direction') {
    return props.label === 'Long'
      ? 'bg-profit-500/20 text-profit-400 border-profit-500/30'
      : 'bg-loss-500/20 text-loss-400 border-loss-500/30'
  }
  if (props.type === 'emotion') {
    const map: Record<string, string> = {
      Calm: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      Confident: 'bg-profit-500/20 text-profit-400 border-profit-500/30',
      Fear: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      Greed: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      FOMO: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      Revenge: 'bg-red-500/20 text-red-400 border-red-500/30',
    }
    return map[props.label] || 'badge-neutral'
  }
  return 'badge-neutral'
})
</script>
