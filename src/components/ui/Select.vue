<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="id" class="text-xs font-medium text-neutral-400 uppercase tracking-wide">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>
    <select
      :id="id"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      :class="['input-base', error ? 'border-red-500' : '']" v-bind="$attrs"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="optKey(opt)" :value="optValue(opt)">
        {{ optLabel(opt) }}
      </option>
    </select>
    <p v-if="error" class="text-xs text-red-400">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  id?: string
  options: (string | { value: string; label: string })[]
  placeholder?: string
  error?: string
  required?: boolean
}>(), { id: () => `select-${Math.random().toString(36).slice(2)}` })

defineEmits<{ (e: 'update:modelValue', val: string): void }>()

function optKey(o: string | { value: string; label: string }) { return typeof o === 'string' ? o : o.value }
function optValue(o: string | { value: string; label: string }) { return typeof o === 'string' ? o : o.value }
function optLabel(o: string | { value: string; label: string }) { return typeof o === 'string' ? o : o.label }
</script>
