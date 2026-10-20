<template>
  <Layout>
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">Daily Review</h2>
        <Input type="date" v-model="selectedDate" class="w-40" />
      </div>

      <!-- Auto-filled stats -->
      <div class="grid grid-cols-2 gap-4">
        <StatCard label="Trades Today" :value="todayCount" format="number" />
        <StatCard label="Daily P&L" :value="todayPnl" format="currency" :colorize="true" />
      </div>

      <!-- Review form -->
      <Card>
        <h3 class="text-sm font-semibold mb-4 text-neutral-300">End of Day Reflection</h3>
        <div class="space-y-4">
          <!-- Mood -->
          <div>
            <label class="text-xs font-medium text-neutral-400 uppercase tracking-wide block mb-2">Mood</label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="m in moods" :key="m.value"
                type="button"
                @click="form.mood = m.value"
                :class="[
                  'px-3 py-1.5 rounded-lg text-lg border transition-colors',
                  form.mood === m.value
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-neutral-700 hover:border-neutral-600'
                ]"
                :title="m.label"
              >
                {{ m.emoji }}
              </button>
            </div>
          </div>

          <div>
            <label class="text-xs font-medium text-neutral-400 uppercase tracking-wide block mb-2">What Went Well</label>
            <textarea
              v-model="form.went_well"
              rows="3"
              placeholder="Describe your wins today..."
              class="input-base resize-none"
            />
          </div>

          <div>
            <label class="text-xs font-medium text-neutral-400 uppercase tracking-wide block mb-2">What to Improve</label>
            <textarea
              v-model="form.to_improve"
              rows="3"
              placeholder="What mistakes did you make?"
              class="input-base resize-none"
            />
          </div>

          <div>
            <label class="text-xs font-medium text-neutral-400 uppercase tracking-wide block mb-2">Plan for Tomorrow</label>
            <textarea
              v-model="form.plan_tomorrow"
              rows="3"
              placeholder="What is your game plan for tomorrow?"
              class="input-base resize-none"
            />
          </div>
        </div>
      </Card>

      <div class="flex justify-end">
        <Button @click="save" :disabled="saving">
          <Spinner v-if="saving" size="sm" />
          <span v-else>Save Review</span>
        </Button>
      </div>

      <!-- History -->
      <div v-if="reviewStore.reviews.length > 0">
        <h3 class="text-sm font-semibold text-neutral-400 mb-3">Past Reviews</h3>
        <div class="space-y-3">
          <div
            v-for="r in pastReviews"
            :key="r.date"
            class="card p-4 cursor-pointer hover:border-neutral-700 transition-colors"
            @click="loadReview(r.date)"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium">{{ formatDate(r.date) }}</span>
              <span class="text-lg">{{ moodEmoji(r.mood) }}</span>
            </div>
            <p v-if="r.went_well" class="text-xs text-neutral-400 truncate">{{ r.went_well }}</p>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { format } from 'date-fns'
import Layout from '../components/layout/Layout.vue'
import Card from '../components/ui/Card.vue'
import StatCard from '../components/ui/StatCard.vue'
import Input from '../components/ui/Input.vue'
import Button from '../components/ui/Button.vue'
import Spinner from '../components/ui/Spinner.vue'
import { useDailyReviewStore } from '../stores/dailyReview'
import { useTradesStore } from '../stores/trades'
import type { Mood } from '../types'

const reviewStore = useDailyReviewStore()
const tradesStore = useTradesStore()

const selectedDate = ref(new Date().toISOString().slice(0, 10))
const saving = ref(false)

const moods = [
  { value: 'Great' as Mood, label: 'Great', emoji: '😄' },
  { value: 'Good' as Mood, label: 'Good', emoji: '🙂' },
  { value: 'Neutral' as Mood, label: 'Neutral', emoji: '😐' },
  { value: 'Bad' as Mood, label: 'Bad', emoji: '😟' },
  { value: 'Terrible' as Mood, label: 'Terrible', emoji: '😩' },
]

const form = reactive({
  mood: 'Neutral' as Mood,
  went_well: '',
  to_improve: '',
  plan_tomorrow: '',
})

const todayTrades = computed(() =>
  tradesStore.trades.filter(t => t.date_close?.slice(0, 10) === selectedDate.value)
)
const todayCount = computed(() => todayTrades.value.length)
const todayPnl = computed(() => todayTrades.value.reduce((s, t) => s + t.pnl, 0))

const pastReviews = computed(() =>
  [...reviewStore.reviews].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)
)

function loadReview(date: string) {
  selectedDate.value = date
}

watch(selectedDate, (date) => {
  const existing = reviewStore.getByDate(date)
  if (existing) {
    form.mood = existing.mood
    form.went_well = existing.went_well
    form.to_improve = existing.to_improve
    form.plan_tomorrow = existing.plan_tomorrow
  } else {
    form.mood = 'Neutral'
    form.went_well = ''
    form.to_improve = ''
    form.plan_tomorrow = ''
  }
}, { immediate: true })

async function save() {
  saving.value = true
  await reviewStore.saveReview({
    date: selectedDate.value,
    mood: form.mood,
    trades_count: todayCount.value,
    daily_pnl: todayPnl.value,
    went_well: form.went_well,
    to_improve: form.to_improve,
    plan_tomorrow: form.plan_tomorrow,
  })
  saving.value = false
}

function formatDate(d: string) {
  return format(new Date(d), 'EEE, MMM d yyyy')
}

function moodEmoji(mood: string) {
  return moods.find(m => m.value === mood)?.emoji || '😐'
}

onMounted(() => {
  reviewStore.fetchReviews()
})
</script>
