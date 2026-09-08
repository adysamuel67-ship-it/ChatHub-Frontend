import Avatar from '../Avatar'
import { formatDay } from '../../lib/utils'
import { CheckCheck } from 'lucide-react'
import type { ConversationSummary } from '../../types'

interface ConversationItemProps {
  conversation: ConversationSummary
  active: boolean
  online: boolean
  onClick: () => void
}

export default function ConversationItem({ conversation, active, online, onClick }: ConversationItemProps) {
  const { user, last_message, last_message_at, unread } = conversation

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick()
      }}
      className={`group relative flex cursor-pointer items-center gap-3 px-3 py-3 transition-colors duration-150 ${
        active ? 'bg-emerald-50/80' : 'hover:bg-gray-50'
      }`}
    >
      {active && <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-gradient-to-b from-emerald-400 to-teal-500" />}

      <Avatar name={user.name} size="md" online={online} className={active ? 'ring-2 ring-emerald-200 rounded-full' : ''} />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[15px] font-semibold text-[#111b21]">{user.name}</span>
          {last_message_at && (
            <span className="shrink-0 text-[11px] font-medium text-gray-400">{formatDay(last_message_at)}</span>
          )}
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="flex min-w-0 flex-1 items-center gap-1 text-[13px] text-gray-500">
            {last_message ? (
              <>
                <CheckCheck className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span className="truncate">{last_message}</span>
              </>
            ) : (
              <span className="text-[13px] text-gray-400">Start the conversation</span>
            )}
          </span>

          {unread > 0 && (
            <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-1.5 text-[11px] font-bold text-white shadow-sm shadow-emerald-500/40">
              {unread}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}