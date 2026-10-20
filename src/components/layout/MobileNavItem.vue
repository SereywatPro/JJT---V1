<template>
  <router-link
    :to="to"
    class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors"
    :class="isActive ? 'text-blue-500' : 'text-neutral-500'"
  >
    <component :is="icon" :size="22" />
    <span class="text-[10px] font-medium">{{ label }}</span>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { Component } from 'vue'

const props = defineProps<{ to: string; label: string; icon: Component }>()
const route = useRoute()
const isActive = computed(() => route.path === props.to || (route.path.startsWith(props.to + '/') && props.to !== '/'))
</script>
