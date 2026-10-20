<template>
  <Card>
    <p class="text-xs font-medium text-neutral-400 uppercase tracking-wide">{{ label }}</p>
    <p class="mt-2 text-2xl font-bold font-mono" :class="valueClass">{{ formattedValue }}</p>
    <p v-if="sub" class="mt-1 text-xs text-neutral-500">{{ sub }}</p>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from './Card.vue'

const props = defineProps<{
  label: string
  value: number | string
  format?: 'currency' | 'percent' | 'number' | 'text'
  sub?: string
  colorize?: boolean
}>()

const formattedValue = computed(() => {
  const v = props.value
  if (typeof v === 'string') return v

  // Handle Infinity or NaN gracefully
  if (v === Infinity || v === -Infinity) return 'MAX'
  if (Number.isNaN(v)) return '—'

  if (props.format === 'currency') return (v >= 0 ? '+' : '') + '$' + Math.abs(v).toFixed(2)
  if (props.format === 'percent') return v.toFixed(1) + '%'
  if (props.format === 'number') return v.toFixed(2)
  return String(v)
})

const valueClass = computed(() => {
  if (!props.colorize || typeof props.value !== 'number') return 'text-white'
  if (props.value > 0) return 'pnl-positive'
  if (props.value < 0) return 'pnl-negative'
  return 'text-white'
})
</script>
