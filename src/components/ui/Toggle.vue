<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    @click="$emit('update:modelValue', !modelValue)"
    :class="[
      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900',
      modelValue ? 'bg-blue-600' : 'bg-neutral-700',
    ]"
  >
    <span
      :class="[
        'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
        modelValue ? 'translate-x-6' : 'translate-x-1',
      ]"
    />
  </button>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean }>()
defineEmits<{ (e: 'update:modelValue', val: boolean): void }>()
</script>
