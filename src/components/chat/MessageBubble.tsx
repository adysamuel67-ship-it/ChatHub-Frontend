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
    <div className={`anim-msg flex w-full px-3 py-[2px] md:px-5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[76%] rounded-[14px] px-3 pb-1.5 pt-2 shadow-[0_1px_2px_rgba(15,23,42,0.08)] md:max-w-[58%] ${
          isOwn
            ? 'rounded-br-[4px] bg-gradient-to-br from-[#d7f7e9] to-[#c7f0df]'
            : 'rounded-bl-[4px] bg-white'
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-[14.5px] leading-[1.45] text-[#111b21]">
          {message.message}
        </p>
        <div className="mt-0.5 flex items-center justify-end gap-1">
          <span className="text-[10.5px] text-gray-500">{formatTime(message.created_at)}</span>
          <Double
            className={`h-[15px] w-[15px] ${isOwn ? (message.is_read ? 'text-emerald-500' : 'text-emerald-400') : 'text-gray-400'}`}
          />
        </div>
      </div>
    </div>
  )
}