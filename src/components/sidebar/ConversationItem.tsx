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
      className={`group flex w-full cursor-pointer items-center gap-3 border-b border-[#e9edef] px-4 py-3 text-left transition-colors duration-100 ${
        active ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'
      }`}
    >
      <Avatar name={user.name} size="md" />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[16px] font-normal text-[#111b21]">{user.name}</span>
          {last_message_at && (
            <span className="shrink-0 text-[12px] text-[#8696a0]">{formatDay(last_message_at)}</span>
          )}
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="flex min-w-0 flex-1 items-center gap-1 text-[14px] text-[#667781]">
            {last_message ? (
              <>
                <CheckCheck className="h-4 w-4 shrink-0 text-[#8696a0]" />
                <span className="truncate">{last_message}</span>
              </>
            ) : (
              <span className="text-[14px] text-[#8696a0]">Start the conversation</span>
            )}
          </span>

          {unread > 0 && (
            <span className="flex h-[20px] min-w-[20px] shrink-0 items-center justify-center rounded-full bg-[#25d366] px-1.5 text-[11px] font-bold text-white">
              {unread}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}