import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, setAccessToken, setRefreshToken } from '../lib/api'
import { publishUser } from '../lib/directory'
import type { User } from '../types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  init: () => Promise<void>
  login: (phone: string, password: string) => Promise<void>
  signUp: (name: string, phone: string, password: string, email?: string) => Promise<void>
  loginAfterSignUp: (phone: string, password: string) => Promise<void>
  updateUser: (payload: Partial<Pick<User, 'name' | 'phone' | 'email'>>) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: true,

      init: async () => {
        const { user, accessToken, refreshToken } = get()
        if (refreshToken) setRefreshToken(refreshToken)
        if (user && accessToken) {
          setAccessToken(accessToken)
          try {
            const fresh = await api.getCurrentUser(user.user_id)
            set({ user: fresh })
          } catch {
            // token invalid — fall through to logged-out state
            setAccessToken(null)
            setRefreshToken(null)
            set({ user: null, accessToken: null, refreshToken: null })
          }
        }
        set({ isLoading: false })
      },

login: async (phone, password) => {
    const res = await api.login(phone, password)
    setAccessToken(res.access_token)
    setRefreshToken(res.refresh_token)
    const decoded = decodeJwt(res.access_token)
    const currentUser = await api.getCurrentUser(decoded.user.user_id)
    publishUser(phone, currentUser.user_id)
    set({ accessToken: res.access_token, refreshToken: res.refresh_token, user: currentUser })
  },

      signUp: async (name, phone, password, email) => {
        await api.signUp({ name, phone, password, email })
      },

      loginAfterSignUp: async (phone, password) => {
        const res = await api.login(phone, password)
        setAccessToken(res.access_token)
        setRefreshToken(res.refresh_token)
        const decoded = decodeJwt(res.access_token)
        const currentUser = await api.getCurrentUser(decoded.user.user_id)
        publishUser(phone, currentUser.user_id)
        set({ accessToken: res.access_token, refreshToken: res.refresh_token, user: currentUser })
      },

      updateUser: async (payload) => {
        const { user } = get()
        if (!user) return
        const updated = await api.updateUser(user.user_id, payload)
        set({ user: updated })
      },

      logout: () => {
        setAccessToken(null)
        setRefreshToken(null)
        set({ user: null, accessToken: null, refreshToken: null })
      },
    }),
    { name: 'chathub-auth' },
  ),
)

// -- helpers -------------------------------------------------------------

function decodeJwt(token: string): { user: { user_id: number; role: string } } {
  const part = token.split('.')[1]
  return JSON.parse(atob(part))
}

export function extractUserId(token: string): number | null {
  try {
    return decodeJwt(token).user.user_id
  } catch {
    return null
  }
}