import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001/api/v1'

export const client = axios.create({
  baseURL: API_BASE,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request: attach access token ─────────────────────────────────────────────
client.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response: auto-refresh on 401 ────────────────────────────────────────────
let refreshing = false
let queue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

client.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config

    // Only intercept 401s that aren't the login or refresh endpoints
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes('/auth/login') ||
      original.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    if (refreshing) {
      // Queue requests while refresh is in flight
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(client(original))
          },
          reject,
        })
      })
    }

    original._retry = true
    refreshing     = true

    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) throw new Error('No refresh token')

      const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken })
      localStorage.setItem('access_token',  data.accessToken)
      localStorage.setItem('refresh_token', data.refreshToken)

      // Flush queue
      queue.forEach(p => p.resolve(data.accessToken))
      queue = []

      original.headers.Authorization = `Bearer ${data.accessToken}`
      return client(original)
    } catch (e) {
      queue.forEach(p => p.reject(e))
      queue = []
      // Force logout
      const auth = useAuthStore()
      auth.forceLogout()
      return Promise.reject(e)
    } finally {
      refreshing = false
    }
  }
)
