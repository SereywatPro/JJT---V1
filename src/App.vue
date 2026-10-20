<template>
  <router-view />
  <Toaster position="top-right" :duration="3500" />
</template>

<script setup lang="ts">
import { Toaster } from 'vue-hot-toast'
</script>
