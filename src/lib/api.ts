import type { AuthResponse, Contact, ChatMessage, ConversationSummary, PresenceResponse, SignUpPayload, User } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

let accessToken: string | null = localStorage.getItem('chathub_access_token')
let refreshToken: string | null = localStorage.getItem('chathub_refresh_token')
let refreshing: Promise<string | null> | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
  if (token) localStorage.setItem('chathub_access_token', token)
  else localStorage.removeItem('chathub_access_token')
}

export function getAccessToken() {
  return accessToken
}

export function setRefreshToken(token: string | null) {
  refreshToken = token
  if (token) localStorage.setItem('chathub_refresh_token', token)
  else localStorage.removeItem('chathub_refresh_token')
}

export function getRefreshToken() {
  return refreshToken
}

async function request<T>(path: string, options: RequestInit = {}, isForm = false, retried = false): Promise<T> | never {
  const headers: Record<string, string> = {}
  if (!isForm) headers['Content-Type'] = 'application/json'
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (res.status === 401 && !retried) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      return request<T>(path, options, isForm, true)
    }
    setAccessToken(null)
    setRefreshToken(null)
    window.dispatchEvent(new CustomEvent('chathub:unauthorized'))
    throw new Error('Session expired. Please log in again.')
  }

  if (res.status === 204) return undefined as T

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const detail = (data && (data.detail || data.message)) || `Request failed: ${res.status}`
    throw new Error(detail)
  }

  return data as T
}

export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshToken) return null
  if (refreshing) return refreshing

  refreshing = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${refreshToken}` },
      })

      if (!res.ok) {
        setAccessToken(null)
        setRefreshToken(null)
        return null
      }

      const data = (await res.json()) as AuthResponse
      setAccessToken(data.access_token)
      return data.access_token
    } catch {
      setAccessToken(null)
      setRefreshToken(null)
      return null
    } finally {
      refreshing = null
    }
  })()

  return refreshing
}

export const api = {
  signUp: (payload: SignUpPayload) =>
    request<{ user_id: number; name: string; phone: string; role: string; is_verified: boolean; email: string | null; created_at: string }>('/auth/sign_up', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (username: string, password: string) => {
    const body = new URLSearchParams({ username, password })
    return request<AuthResponse>('/auth/login', { method: 'POST', body }, true)
  },

  getCurrentUser: (userId: number) => request<User>(`/users/get/user/${userId}`, { method: 'GET' }),

  lookupUserByPhone: (phone: string) =>
    request<User | null>(`/users/lookup/${encodeURIComponent(phone)}`, { method: 'GET' }),

  searchUsers: (q: string, limit = 12) =>
    request<User[]>(`/users/search?q=${encodeURIComponent(q)}&limit=${limit}`, { method: 'GET' }),

  listContacts: (search = '') =>
    request<Contact[]>(
      `/phonebook/contacts${search ? `?search=${encodeURIComponent(search)}` : ''}`,
      { method: 'GET' },
    ),

  listConversations: (search = '') =>
    request<ConversationSummary[]>(
      `/chat/conversations${search ? `?search=${encodeURIComponent(search)}` : ''}`,
      { method: 'GET' },
    ),

  getPresence: () => request<PresenceResponse>('/chat/presence', { method: 'GET' }),

  createContact: (name: string, phone: string, email?: string) =>
    request<Contact>('/phonebook/create_contact', {
      method: 'POST',
      body: JSON.stringify({ name, phone, email }),
    }),

  deleteContact: (contactId: number) =>
    request<void>(`/phonebook/contacts/${contactId}`, { method: 'DELETE' }),

  updateUser: (userId: number, payload: Partial<Pick<User, 'name' | 'phone' | 'email'>>) =>
    request<User>(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(payload) }),
}

export function getConversationMessages(otherUserId: number): Promise<ChatMessage[]> {
  return request<ChatMessage[]>(`/chat/conversations/${otherUserId}/messages`, { method: 'GET' })
}
