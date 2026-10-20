const SESSION_KEY = 'ttj_auth'
const API_KEY_STORAGE = 'ttj_api_key'

// The Google Apps Script Secret Key configured in your Code.gs
const BACKEND_API_KEY = '5d0725ad311dd6b9d82019a17f3af2611c6c1d7f73c0d42a1d7d491ba2e0f4fb'

/**
 * Client authentication and API key management.
 */
export function login(userPass: string): boolean {
  if (!userPass || !userPass.trim()) return false
  sessionStorage.setItem(SESSION_KEY, '1')
  // Store the backend API key so all GAS requests are authenticated
  sessionStorage.setItem(API_KEY_STORAGE, BACKEND_API_KEY)
  return true
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(API_KEY_STORAGE)
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function getApiKey(): string {
  return sessionStorage.getItem(API_KEY_STORAGE) || BACKEND_API_KEY
}
