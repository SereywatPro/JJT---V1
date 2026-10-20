<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('close')" />
        <!-- Panel -->
        <div class="relative bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl w-full max-w-md p-6">
          <button
            class="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
            @click="$emit('close')"
          >
            <X :size="18" />
          </button>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from '@lucide/vue'
defineProps<{ open: boolean }>()
defineEmits<{ (e: 'close'): void }>()
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
