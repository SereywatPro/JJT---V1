import type { GasResponse } from '../types'
import { getApiKey } from './auth'

const GAS_URL = import.meta.env.VITE_GAS_URL as string

if (!GAS_URL) {
  console.warn('[TTJ] VITE_GAS_URL is not set. Open Settings to configure it.')
}

/**
 * Send an authenticated action to the Google Apps Script Web App.
 * Automatically injects the apiKey from current user session.
 * Retries once on network failure.
 */
export async function callGAS<T = unknown>(
  action: string,
  payload?: unknown,
  customApiKey?: string,
  retries = 1
): Promise<GasResponse<T>> {
  const url = GAS_URL || getStoredGasUrl()

  if (!url) {
    return { success: false, error: 'GAS URL is not configured. Open Settings to add it.' }
  }

  const apiKey = customApiKey || getApiKey()

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // avoids CORS preflight with GAS
      body: JSON.stringify({ action, apiKey, payload }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const json: GasResponse<T> = await response.json()
    return json
  } catch (err) {
    if (retries > 0) {
      await sleep(1000)
      return callGAS<T>(action, payload, customApiKey, retries - 1)
    }
    const message = err instanceof Error ? err.message : 'Network error'
    return { success: false, error: message }
  }
}

/** Health and Authorization check — verifies both deployment and secret key */
export async function pingGAS(apiKey?: string): Promise<boolean> {
  const url = GAS_URL || getStoredGasUrl()
  if (!url) return false
  try {
    const res = await callGAS<{ status: string }>('ping', {}, apiKey || getApiKey(), 0)
    return res.success === true
  } catch {
    return false
  }
}

// ─── Runtime GAS URL override (from Settings) ────────────────────────────────

const STORED_URL_KEY = 'ttj_gas_url'

export function setGasUrl(url: string): void {
  localStorage.setItem(STORED_URL_KEY, url)
}

export function getStoredGasUrl(): string {
  return localStorage.getItem(STORED_URL_KEY) || ''
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
