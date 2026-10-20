<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-xs font-medium text-neutral-400 uppercase tracking-wide">{{ label }}</label>
    <div class="flex flex-wrap gap-2 p-3 bg-neutral-800 border border-neutral-700 rounded-lg min-h-[42px]">
      <button
        v-for="opt in options"
        :key="opt"
        type="button"
        @click="toggle(opt)"
        :class="[
          'text-xs font-medium px-2.5 py-1 rounded-full border transition-colors',
          selected.includes(opt)
            ? 'bg-blue-600 border-blue-500 text-white'
            : 'bg-neutral-700 border-neutral-600 text-neutral-300 hover:border-neutral-500',
        ]"
      >
        {{ opt }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string[]
  options: string[]
  label?: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', val: string[]): void }>()

const selected = computed(() => props.modelValue)

function toggle(opt: string) {
  const current = [...props.modelValue]
  const idx = current.indexOf(opt)
  if (idx === -1) current.push(opt)
  else current.splice(idx, 1)
  emit('update:modelValue', current)
}
</script>
