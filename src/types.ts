export interface User {
  user_id: number
  name: string
  phone: string
  role: 'user' | 'super_admin'
  is_verified: boolean
  email?: string | null
  created_at: string
}

export interface Contact {
  contact_id: number
  name: string
  phone: string
  email?: string | null
  created_at: string
  user_id?: number | null
}

export interface ChatMessage {
  chat_id: number
  sender_id: number
  reciever_id: number
  message: string
  is_read: boolean
  created_at: string
}

export interface WsChatMessage {
  from: number
  to?: number
  message: string
  body: string
  sent_at: string
  self?: boolean
}

export interface ChatUserInfo {
  user_id: number
  name: string
  phone: string
  email?: string | null
}

export interface ConversationSummary {
  user: ChatUserInfo
  last_message: string | null
  last_message_at: string | null
  unread: number
}

export interface PresenceResponse {
  online: number[]
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  type: 'Bearer'
}

export interface SignUpPayload {
  name: string
  phone: string
  email?: string
  password: string
}