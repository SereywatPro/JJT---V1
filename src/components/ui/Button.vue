<template>
  <button
    v-bind="$attrs"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClasses,
      variantClasses,
    ]"
  >
    <component v-if="icon && iconPosition === 'left'" :is="icon" :size="iconSize" />
    <slot />
    <component v-if="icon && iconPosition === 'right'" :is="icon" :size="iconSize" />
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: Component
  iconPosition?: 'left' | 'right'
}>(), {
  variant: 'primary',
  size: 'md',
  iconPosition: 'left',
})

const iconSize = computed(() => props.size === 'sm' ? 14 : props.size === 'lg' ? 20 : 16)

const sizeClasses = computed(() => ({
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
}[props.size]))

const variantClasses = computed(() => ({
  primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
  ghost: 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white focus:ring-neutral-500',
  danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  outline: 'border border-neutral-700 hover:bg-neutral-800 text-neutral-300 hover:text-white focus:ring-neutral-500',
}[props.variant]))
</script>
