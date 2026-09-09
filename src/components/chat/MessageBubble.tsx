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
        className={`relative max-w-[78%] rounded-lg px-2.5 pb-1.5 pt-1.5 shadow-[0_1px_0.5px_rgba(11,27,42,0.13)] md:max-w-[58%] ${
          isOwn
            ? 'rounded-tr-[2px] bg-[#d9fdd3]'
            : 'rounded-tl-[2px] bg-white'
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-[14.2px] leading-[1.35] text-[#111b21]">
          {message.message}
        </p>
        <div className="ml-auto mt-0.5 flex w-fit items-center justify-end gap-1">
          <span className="text-[11px] text-[#667781]">{formatTime(message.created_at)}</span>
          <Double
            className={`h-[15px] w-[15px] ${
              isOwn ? (message.is_read ? 'text-[#53bdeb]' : 'text-[#a7b6c0]') : 'text-[#8696a0]'
            }`}
          />
        </div>
      </div>
    </div>
  )
}