import Avatar from '../Avatar'
import { formatDay } from '../../lib/utils'
import { CheckCheck } from 'lucide-react'
import type { ConversationSummary } from '../../types'

interface ConversationItemProps {
  conversation: ConversationSummary
  active: boolean
  onClick: () => void
}

export default function ConversationItem({ conversation, active, onClick }: ConversationItemProps) {
  const { user, last_message, last_message_at, unread } = conversation

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick()
      }}
      className={`group flex w-full cursor-pointer items-center gap-3 border-b border-[#e2e8f0] px-4 py-3 text-left transition-colors duration-100 ${
        active ? 'bg-[#f1f5f9]' : 'hover:bg-[#f8fafc]'
      }`}
    >
      <Avatar name={user.name} size="md" />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[16px] font-normal text-[#0f172a]">{user.name}</span>
          {last_message_at && (
            <span className="shrink-0 text-[12px] text-[#94a3b8]">{formatDay(last_message_at)}</span>
          )}
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="flex min-w-0 flex-1 items-center gap-1 text-[14px] text-[#64748b]">
            {last_message ? (
              <>
                <CheckCheck className="h-4 w-4 shrink-0 text-[#94a3b8]" />
                <span className="truncate">{last_message}</span>
              </>
            ) : (
              <span className="text-[14px] text-[#94a3b8]">Start the conversation</span>
            )}
          </span>

          {unread > 0 && (
            <span className="flex h-[20px] min-w-[20px] shrink-0 items-center justify-center rounded-full bg-[#2563EB] px-1.5 text-[11px] font-bold text-white shadow-sm shadow-blue-500/30">
              {unread}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
