import { create } from 'zustand'
import { api, getConversationMessages, refreshAccessToken } from '../lib/api'
import { publishUser } from '../lib/directory'
import type { ChatMessage, Contact, ConversationSummary, WsChatMessage } from '../types'
import { useAuthStore } from './auth'

function isJwtExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now() + 15000
  } catch {
    return false
  }
}

interface ChatState {
  contacts: Contact[]
  conversations: ConversationSummary[]
  messages: Record<number, ChatMessage[]>
  activeUserId: number | null
  profileContact: Contact | null
  ws: WebSocket | null
  online: Set<number>
  isLoading: boolean
  isSearching: boolean

  connectSocket: () => void
  disconnectSocket: () => void
  setProfileContact: (contact: Contact | null) => void
  loadContacts: () => Promise<void>
  loadConversations: (search?: string) => Promise<void>
  searchUsers: (q: string) => Promise<import('../types').User[]>
  openChat: (userId: number) => Promise<void>
  sendMessage: (toUserId: number, body: string) => void
  handleIncoming: (msg: WsChatMessage) => void
  markConversationRead: (userId: number) => void
  addContact: (name: string, phone: string, email?: string) => Promise<Contact>
  removeContact: (contactId: number) => Promise<void>
  clearActiveChat: () => void
  getActiveUser: () => ConversationSummary | null
  getContactForUser: (userId: number) => Contact | undefined
}

let wsInstance: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let presenceTimer: ReturnType<typeof setInterval> | null = null
let pendingQueue: { to: number; body: string }[] = []

async function resolveContactUserId(contact: Contact): Promise<Contact> {
  if (contact.user_id != null) return contact
  try {
    const target = await api.lookupUserByPhone(contact.phone)
    if (target) {
      publishUser(contact.phone, target.user_id)
      return { ...contact, user_id: target.user_id }
    }
  } catch {
    // user not on ChatHub — keep contact without a user_id
  }
  return contact
}

async function connectSocketFor() {
  let token = useAuthStore.getState().accessToken
  if (token && isJwtExpired(token)) {
    const fresh = await refreshAccessToken()
    if (fresh) {
      token = fresh
      useAuthStore.setState({ accessToken: fresh })
    }
  }
  if (!token) return

  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const url = `${proto}://${window.location.host}/chat/ws/chat?token=${token}`
  const ws = new WebSocket(url)
  wsInstance = ws

  ws.onopen = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    reconnectTimer = null
    if (pendingQueue.length) {
      for (const item of pendingQueue.splice(0)) ws.send(JSON.stringify(item))
    }
  }

  ws.onclose = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(() => {
      const s = useChatStore.getState()
      if (s.ws === wsInstance || !s.ws) connectSocketFor()
    }, 3000)
  }

  ws.onmessage = (e) => {
    try {
      const msg: WsChatMessage = JSON.parse(e.data)
      useChatStore.getState().handleIncoming(msg)
    } catch {
      // ignore malformed payloads
    }
  }

  useChatStore.setState({ ws })
}

function startPresencePolling() {
  if (presenceTimer) clearInterval(presenceTimer)
  const poll = async () => {
    try {
      const res = await api.getPresence()
      useChatStore.setState({ online: new Set(res.online) })
    } catch {
      // presence is best-effort
    }
  }
  poll()
  presenceTimer = setInterval(poll, 10000)
}

export const useChatStore = create<ChatState>()((set, get) => ({
  contacts: [],
  conversations: [],
  messages: {},
  activeUserId: null,
  profileContact: null,
  ws: null,
  online: new Set<number>(),
  isLoading: true,
  isSearching: false,

  connectSocket: () => {
    const { ws } = get()
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return
    connectSocketFor()
    startPresencePolling()
  },

  disconnectSocket: () => {
    wsInstance?.close()
    wsInstance = null
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (presenceTimer) clearInterval(presenceTimer)
    set({ ws: null, online: new Set(), conversations: [], messages: {}, contacts: [], activeUserId: null, profileContact: null, isLoading: true })
  },

  setProfileContact: (contact) => set({ profileContact: contact }),

  loadContacts: async () => {
    try {
      const contacts = await api.listContacts()
      const resolved = await Promise.all(contacts.map(resolveContactUserId))
      set({ contacts: resolved })
    } catch {
      set({ contacts: [] })
    }
  },

  loadConversations: async (search = '') => {
    try {
      const convos = await api.listConversations(search)
      set({ conversations: convos, isLoading: false })
    } catch {
      set({ conversations: [], isLoading: false })
    }
  },

  searchUsers: async (q) => {
    if (!q.trim()) return []
    set({ isSearching: true })
    try {
      return await api.searchUsers(q)
    } finally {
      set({ isSearching: false })
    }
  },

  openChat: async (userId) => {
    const state = get()
    set({ activeUserId: userId })

    if (!state.conversations.some((c) => c.user.user_id === userId)) {
      let summary: ConversationSummary | null = null
      const contact = state.contacts.find((c) => c.user_id === userId)
      if (contact) {
        summary = {
          user: { user_id: userId, name: contact.name, phone: contact.phone, email: contact.email ?? null },
          last_message: null,
          last_message_at: null,
          unread: 0,
        }
      } else {
        try {
          const u = await api.getCurrentUser(userId)
          summary = {
            user: { user_id: u.user_id, name: u.name, phone: u.phone, email: u.email ?? null },
            last_message: null,
            last_message_at: null,
            unread: 0,
          }
        } catch {
          // unknown user — nothing we can render
        }
      }
      if (summary) {
        set({ conversations: [summary, ...get().conversations] })
      }
    }

    const key = String(userId)
    const cached = get().messages[userId]

    if (!cached || !cached.length) {
      const raw = await getConversationMessages(userId)
      set({ messages: { ...get().messages, [key]: raw.reverse() } })
    }
    get().markConversationRead(userId)
  },

  sendMessage: (toUserId, body) => {
    const { ws, messages, activeUserId } = get()
    const currentUserId = useAuthStore.getState().user?.user_id

    const optimistic: ChatMessage = {
      chat_id: Date.now(),
      sender_id: currentUserId ?? toUserId,
      reciever_id: toUserId,
      message: body,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    const existing = messages[toUserId] ?? []
    if (!existing.some((m) => m.chat_id === optimistic.chat_id)) {
      set({ messages: { ...messages, [toUserId]: [...existing, optimistic] } })
    }
    if (activeUserId === toUserId) {
      get().markConversationRead(toUserId)
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ to: toUserId, body }))
    } else {
      // socket reconnecting — hold locally and flush on next open
      pendingQueue.push({ to: toUserId, body })
    }
  },

  handleIncoming: (msg) => {
    const state = get()
    const currentUserId = useAuthStore.getState().user?.user_id
    const otherUserId = msg.self ? (msg.to ?? currentUserId ?? msg.from) : msg.from
    if (otherUserId == null) return

    const incoming: ChatMessage = {
      chat_id: Date.now() + Math.random(),
      sender_id: msg.self ? (msg.from ?? currentUserId ?? msg.from) : msg.from,
      reciever_id: msg.self ? msg.from : (currentUserId ?? -1),
      message: msg.body,
      is_read: msg.self || state.activeUserId === otherUserId ? true : false,
      created_at: msg.sent_at,
    }

    const existing = state.messages[otherUserId] ?? []
    const last = existing[existing.length - 1]
    const sameText = last?.message === msg.body
    const recent = last && Date.now() - new Date(last.created_at).getTime() < 8000

    if (msg.self && last && sameText && recent) {
      const updated = [...existing]
      updated[updated.length - 1] = { ...last, chat_id: incoming.chat_id, created_at: msg.sent_at, is_read: true }
      set({ messages: { ...state.messages, [otherUserId]: updated } })
      return
    }

    if (last && new Date(last.created_at).getTime() >= new Date(msg.sent_at).getTime()) return
    set({ messages: { ...state.messages, [otherUserId]: [...existing, incoming] } })

    if (!msg.self) {
      const conv = state.conversations.find((c) => c.user.user_id === otherUserId)
      if (conv) {
        const updated = state.conversations.map((c) =>
          c.user.user_id === otherUserId
            ? { ...c, last_message: msg.body, last_message_at: msg.sent_at, unread: state.activeUserId === otherUserId ? c.unread : c.unread + 1 }
            : c,
        )
        updated.sort((a, b) => (b.last_message_at ?? '').localeCompare(a.last_message_at ?? ''))
        set({ conversations: updated })
      } else {
        get().loadConversations()
      }
    }
  },

  markConversationRead: (userId) => {
    const { messages, conversations } = get()
    const currentUserId = useAuthStore.getState().user?.user_id
    const msgs = messages[userId] ?? []
    if (msgs.some((m) => m.reciever_id === currentUserId && !m.is_read)) {
      set({
        messages: {
          ...messages,
          [userId]: msgs.map((m) => (m.reciever_id === currentUserId ? { ...m, is_read: true } : m)),
        },
        conversations: conversations.map((c) => (c.user.user_id === userId ? { ...c, unread: 0 } : c)),
      })
    }
  },

  addContact: async (name, phone, email) => {
    const contact = await api.createContact(name, phone, email)
    const resolved = await resolveContactUserId({ ...contact, user_id: undefined })
    set({ contacts: [...get().contacts, resolved] })
    return resolved
  },

  removeContact: async (contactId) => {
    await api.deleteContact(contactId)
    set({ contacts: get().contacts.filter((c) => c.contact_id !== contactId) })
  },

  clearActiveChat: () => set({ activeUserId: null }),

  getActiveUser: () => {
    const { activeUserId, conversations } = get()
    return conversations.find((c) => c.user.user_id === activeUserId) ?? null
  },

  getContactForUser: (userId) => get().contacts.find((c) => c.user_id === userId),
}))