import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DailyReview } from '../types'
import { callGAS } from '../lib/gas'

export const useDailyReviewStore = defineStore('dailyReview', () => {
  const reviews = ref<DailyReview[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchReviews() {
    loading.value = true
    error.value = null
    try {
      const res = await callGAS<DailyReview[]>('getDailyReviews')
      if (res.success && res.data) {
        reviews.value = res.data
      } else {
        error.value = res.error || 'Failed to load reviews'
      }
    } finally {
      loading.value = false
    }
  }

  async function saveReview(review: DailyReview): Promise<boolean> {
    const existing = reviews.value.find(r => r.date === review.date)
    const action = existing ? 'updateDailyReview' : 'addDailyReview'

    // Optimistic update
    if (existing) {
      const idx = reviews.value.indexOf(existing)
      reviews.value[idx] = review
    } else {
      reviews.value.unshift(review)
    }

    const res = await callGAS(action, review)
    return res.success
  }

  function getByDate(date: string): DailyReview | undefined {
    return reviews.value.find(r => r.date === date)
  }

  return { reviews, loading, error, fetchReviews, saveReview, getByDate }
})
