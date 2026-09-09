import { Check, CheckCheck } from 'lucide-react'
import type { ChatMessage } from '../../types'
import { formatTime } from '../../lib/utils'

interface MessageBubbleProps {
  message: ChatMessage
  isOwn: boolean
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const Double = isOwn ? CheckCheck : Check

  return (
    <div className={`anim-msg flex w-full px-4 py-[2px] md:px-6 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[78%] rounded-2xl px-3 pb-1.5 pt-2 shadow-[0_1px_0.5px_rgba(11,27,42,0.13)] md:max-w-[58%] ${
          isOwn
            ? 'rounded-tr-md bg-[#DBEAFE]'
            : 'rounded-tl-md bg-white'
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-[14.2px] leading-[1.35] text-[#0f172a]">
          {message.message}
        </p>
        <div className="ml-auto mt-0.5 flex w-fit items-center justify-end gap-1">
          <span className="text-[11px] text-[#64748b]">{formatTime(message.created_at)}</span>
          <Double
            className={`h-[15px] w-[15px] ${
              isOwn ? (message.is_read ? 'text-[#2563EB]' : 'text-[#93c5fd]') : 'text-[#94a3b8]'
            }`}
          />
        </div>
      </div>
    </div>
  )
}
