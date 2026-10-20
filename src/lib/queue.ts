import type { QueuedAction } from '../types'
import { callGAS } from './gas'

const QUEUE_KEY = 'ttj_queue'

export function enqueue(action: string, payload: unknown): void {
  const queue = getQueue()
  const item: QueuedAction = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    action,
    payload,
    timestamp: new Date().toISOString(),
  }
  queue.push(item)
  saveQueue(queue)
}

export function getQueue(): QueuedAction[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  } catch {
    return []
  }
}

export function clearQueue(): void {
  localStorage.removeItem(QUEUE_KEY)
}

export async function syncQueue(): Promise<{ synced: number; failed: number }> {
  const queue = getQueue()
  let synced = 0
  let failed = 0
  const remaining: QueuedAction[] = []

  for (const item of queue) {
    const result = await callGAS(item.action, item.payload)
    if (result.success) {
      synced++
    } else {
      failed++
      remaining.push(item)
    }
  }

  saveQueue(remaining)
  return { synced, failed }
}

function saveQueue(queue: QueuedAction[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}
