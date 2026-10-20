<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="id" class="text-xs font-medium text-neutral-400 uppercase tracking-wide">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>
    <div class="relative">
      <component v-if="prefixIcon" :is="prefixIcon" :size="16"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
      <input
        :id="id"
        v-bind="$attrs"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :class="[
          'input-base',
          prefixIcon ? 'pl-9' : '',
          error ? 'border-red-500 focus:ring-red-500' : '',
        ]"
      />
    </div>
    <p v-if="error" class="text-xs text-red-400">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-neutral-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(defineProps<{
  modelValue?: string | number
  label?: string
  id?: string
  error?: string
  hint?: string
  required?: boolean
  prefixIcon?: Component
}>(), { id: () => `input-${Math.random().toString(36).slice(2)}` })

defineEmits<{ (e: 'update:modelValue', val: string): void }>()
</script>
