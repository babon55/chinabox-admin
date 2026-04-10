import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import type { AuthUser } from '@/api/auth'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
}))

// Mock authApi
vi.mock('@/api/auth', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
    refresh: vi.fn(),
    updateMe: vi.fn(),
  },
}))

describe('AuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should initialize with null user and no tokens', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.accessToken).toBeNull()
    expect(store.isLoggedIn).toBe(false)
  })

  it('should restore session from localStorage', async () => {
    localStorage.setItem('access_token', 'test-access')
    localStorage.setItem('refresh_token', 'test-refresh')

    const mockUser: AuthUser = { id: '1', name: 'Test', email: 'test@example.com' }
    const { authApi } = await import('@/api/auth')
    vi.mocked(authApi.me).mockResolvedValue({ data: mockUser })

    const store = useAuthStore()
    await store.restore()

    expect(store.user).toEqual(mockUser)
    expect(store.isLoggedIn).toBe(true)
  })

  it('should login successfully', async () => {
    const mockUser: AuthUser = { id: '1', name: 'Test Admin', email: 'admin@test.com' }
    const { authApi } = await import('@/api/auth')
    vi.mocked(authApi.login).mockResolvedValue({
      data: {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        user: mockUser,
      },
    })

    const store = useAuthStore()
    await store.login('admin@test.com', 'password')

    expect(store.accessToken).toBe('new-access')
    expect(store.refreshToken).toBe('new-refresh')
    expect(store.user).toEqual(mockUser)
    expect(localStorage.getItem('access_token')).toBe('new-access')
    expect(localStorage.getItem('refresh_token')).toBe('new-refresh')
  })

  it('should logout and clear session', async () => {
    localStorage.setItem('access_token', 'token')
    localStorage.setItem('refresh_token', 'refresh')
    const { authApi } = await import('@/api/auth')
    vi.mocked(authApi.logout).mockResolvedValue({})

    const store = useAuthStore()
    // Set user directly to simulate logged in state
    store.user = { id: '1', name: 'Test', email: 'test@test.com' } as AuthUser
    store.accessToken = 'token'
    store.refreshToken = 'refresh'

    await store.logout()

    expect(store.user).toBeNull()
    expect(store.accessToken).toBeNull()
    expect(store.refreshToken).toBeNull()
    expect(localStorage.getItem('access_token')).toBeNull()
  })

  it('should force logout when called', async () => {
    const { useRouter } = await import('vue-router')
    const push = vi.fn()
    vi.mocked(useRouter).mockReturnValue({ push, replace: vi.fn() } as any)

    localStorage.setItem('access_token', 'token')
    const store = useAuthStore()
    store.user = { id: '1', name: 'Test', email: 'test@test.com' } as AuthUser

    store.forceLogout()

    expect(store.user).toBeNull()
    expect(store.accessToken).toBeNull()
    expect(push).toHaveBeenCalledWith('/login')
  })
})
