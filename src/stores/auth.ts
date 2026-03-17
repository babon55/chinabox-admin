import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authApi, type AuthUser } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const user         = ref<AuthUser | null>(null)
  const accessToken  = ref<string | null>(localStorage.getItem('access_token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))
  const loading      = ref(false)
  const error        = ref<string | null>(null)

  const isLoggedIn = computed(() => !!accessToken.value && !!user.value)

  // ── Login ───────────────────────────────────────────────────────────────────
  async function login(email: string, password: string) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await authApi.login({ email, password })
      accessToken.value  = data.accessToken
      refreshToken.value = data.refreshToken
      user.value         = data.user
      localStorage.setItem('access_token',  data.accessToken)
      localStorage.setItem('refresh_token', data.refreshToken)
      await router.push('/dashboard')
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Login failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ── Logout ──────────────────────────────────────────────────────────────────
  async function logout() {
    try {
      if (refreshToken.value) await authApi.logout(refreshToken.value)
    } catch { /* ignore */ }
    finally { clearSession() }
  }

  // ── Force logout (called by axios interceptor on failed refresh) ────────────
  function forceLogout() {
    clearSession()
    router.push('/login')
  }

  function clearSession() {
    user.value         = null
    accessToken.value  = null
    refreshToken.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    router.push('/login')
  }

  // ── Restore session on app load ─────────────────────────────────────────────
  async function restore() {
    if (!accessToken.value) return
    try {
      const { data } = await authApi.me()
      user.value = data
    } catch {
      // Token invalid/expired — try refresh
      try {
        if (!refreshToken.value) throw new Error()
        const { data } = await authApi.refresh(refreshToken.value)
        localStorage.setItem('access_token',  data.accessToken)
        localStorage.setItem('refresh_token', data.refreshToken)
        accessToken.value  = data.accessToken
        refreshToken.value = data.refreshToken
        const me = await authApi.me()
        user.value = me.data
      } catch {
        clearSession()
      }
    }
  }

  // ── Update profile ──────────────────────────────────────────────────────────
  async function updateMe(data: Parameters<typeof authApi.updateMe>[0]) {
    const res = await authApi.updateMe(data)
    user.value = res.data
    return res.data
  }

  return {
    user, accessToken, refreshToken, loading, error, isLoggedIn,
    login, logout, forceLogout, clearSession, restore, updateMe,
  }
})
