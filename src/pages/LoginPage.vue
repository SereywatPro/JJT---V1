<template>
  <div class="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-black tracking-tight text-white">TTJ</h1>
        <p class="text-neutral-400 text-sm mt-1">Tracking Journal Trading</p>
      </div>

      <!-- Card -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold mb-2">Sign In</h2>
        <p class="text-xs text-neutral-400 mb-5">
          Enter your password to access your journal.
        </p>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <Input
            v-model="password"
            label="Password"
            id="password"
            type="password"
            placeholder="Enter your password"
            :error="error"
            required
            autocomplete="current-password"
          />
          <Button type="submit" class="w-full" :disabled="loading">
            <Spinner v-if="loading" size="sm" />
            <span v-else>Sign In</span>
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login } from '../lib/auth'
import Input from '../components/ui/Input.vue'
import Button from '../components/ui/Button.vue'
import Spinner from '../components/ui/Spinner.vue'

const router = useRouter()
const route = useRoute()
const password = ref('')
const error = ref('')
const loading = ref(false)

function handleLogin() {
  const entered = password.value.trim()
  if (!entered) {
    error.value = 'Please enter your password'
    return
  }

  const expected = (import.meta.env.VITE_APP_PASSWORD as string) || 'S.e.r.e.y.w.a.t@Abc$189'

  // Accept either the friendly password or the long API key
  if (
    entered === expected ||
    entered === 'S.e.r.e.y.w.a.t@Abc$189' ||
    entered === '5d0725ad311dd6b9d82019a17f3af2611c6c1d7f73c0d42a1d7d491ba2e0f4fb'
  ) {
    login(entered)
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.push(redirect)
  } else {
    error.value = 'Incorrect password'
  }
}
</script>
