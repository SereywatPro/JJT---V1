<template>
  <div class="space-y-2">
    <div class="flex flex-wrap gap-2">
      <span
        v-for="(item, idx) in modelValue"
        :key="item"
        class="inline-flex items-center gap-1 bg-neutral-700 text-neutral-200 text-xs font-medium px-2.5 py-1 rounded-full"
      >
        {{ item }}
        <button type="button" @click="remove(idx)" class="text-neutral-400 hover:text-white ml-1">
          <X :size="12" />
        </button>
      </span>
    </div>
    <div class="flex gap-2">
      <input
        v-model="input"
        :placeholder="placeholder"
        @keydown.enter.prevent="add"
        @keydown.comma.prevent="add"
        class="input-base flex-1 text-sm"
      />
      <Button type="button" variant="ghost" size="sm" @click="add">Add</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X } from '@lucide/vue'
import Button from './Button.vue'

const props = defineProps<{ modelValue: string[]; placeholder?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', val: string[]): void }>()

const input = ref('')

function add() {
  const val = input.value.trim().replace(/,$/, '')
  if (val && !props.modelValue.includes(val)) {
    emit('update:modelValue', [...props.modelValue, val])
  }
  input.value = ''
}

function remove(idx: number) {
  const arr = [...props.modelValue]
  arr.splice(idx, 1)
  emit('update:modelValue', arr)
}
</script>
