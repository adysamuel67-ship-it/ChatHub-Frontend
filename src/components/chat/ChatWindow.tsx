import { useEffect, useRef } from 'react'
import { Lock, MessagesSquare } from 'lucide-react'
import { useChatStore } from '../../store/chat'
import { useAuthStore } from '../../store/auth'
import { formatDay } from '../../lib/utils'
import ChatHeader from './ChatHeader'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import EmptyState from './EmptyState'

function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfThat = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  if (startOfThat === startOfToday) return 'Today'
  if (startOfThat === startOfToday - 86400000) return 'Yesterday'
  return formatDay(dateStr)
}

export default function ChatWindow() {
  const active = useChatStore((s) => s.getActiveUser())
  const messagesById = useChatStore((s) => s.messages)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const user = useAuthStore((s) => s.user)
  const scrollRef = useRef<HTMLDivElement>(null)

  const messages = active ? (messagesById[active.user.user_id] ?? []) : []

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, active?.user.user_id])

  if (!active) return <EmptyState />

  const onSend = (text: string) => sendMessage(active.user.user_id, text)

  return (
    <div className="flex h-full min-w-0 flex-col">
      <ChatHeader />

      <div ref={scrollRef} className="wallpaper flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[56rem] flex-col py-3">
          {/* encryption chip */}
          <div className="mb-2 flex justify-center">
            <div className="flex items-center gap-1.5 rounded-full bg-white/85 px-3.5 py-1.5 text-[12px] font-medium text-gray-500 shadow-sm backdrop-blur">
              <Lock size={12} className="text-emerald-600" />
              Messages are end-to-end encrypted
            </div>
          </div>

          {messages.map((msg, i) => {
            const prev = messages[i - 1]
            const showDate =
              !prev ||
              new Date(msg.created_at).toDateString() !== new Date(prev.created_at).toDateString()

            return (
              <div key={msg.chat_id}>
                {showDate && (
                  <div className="anim-fade-up flex justify-center py-1.5">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-[11.5px] font-semibold text-gray-500 shadow-sm">
                      {getDateLabel(msg.created_at)}
                    </span>
                  </div>
                )}
                <MessageBubble message={msg} isOwn={msg.sender_id === user?.user_id} />
              </div>
            )
          })}

          {messages.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm">
                <MessagesSquare size={28} className="text-emerald-600" />
              </span>
              <p className="mt-4 text-[15px] font-bold text-[#111b21]">Say hi to {active.user.name.split(' ')[0]}</p>
              <p className="mt-1 max-w-xs text-[13px] text-gray-500">
                This is the beginning of your conversation. Messages you send will appear here instantly.
              </p>
            </div>
          )}
        </div>
      </div>

      <MessageInput onSend={onSend} />
    </div>
  )
}