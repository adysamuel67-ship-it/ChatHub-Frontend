import { Smile, Send, Paperclip, Mic } from 'lucide-react'
import { useRef, useState, useCallback, useEffect } from 'react'

interface MessageInputProps {
  onSend: (text: string) => void
}

const EMOJIS = [
  '😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😉',
  '😎', '🤔', '🙄', '😅', '🥳', '😭', '😢', '😴',
  '👍', '👎', '👏', '🙌', '🤝', '💪', '🙏', '🫶',
  '❤️', '💔', '🔥', '✨', '🎉', '🎊', '💯', '👀',
]

export default function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showEmoji) return
    function handleClick(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showEmoji])

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 256) + 'px'
  }, [])

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
    setShowEmoji(false)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [text, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value)
      adjustHeight()
    },
    [adjustHeight],
  )

  const trimmed = text.trim()

  return (
    <div className="relative bg-[#f1f5f9]">
      {showEmoji && (
        <div
          ref={emojiRef}
          className="anim-pop absolute bottom-full right-3 z-50 mb-2 w-[19rem] rounded-2xl border border-[#e2e8f0] bg-white p-3 shadow-2xl shadow-black/20"
        >
          <div className="grid grid-cols-8 gap-0.5">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => {
                  setText((t) => t + e)
                  adjustHeight()
                  textareaRef.current?.focus()
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[19px] transition hover:bg-[#f1f5f9]"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-end gap-2 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 md:px-4">
        <button
          onClick={() => setShowEmoji((v) => !v)}
          className={`icon-btn shrink-0 ${showEmoji ? '!text-[#2563EB] !bg-blue-100' : '!text-[#94a3b8]'}`}
          title="Emoji"
        >
          <Smile size={22} />
        </button>

        <button className="icon-btn shrink-0 hidden sm:flex !text-[#94a3b8]" title="Attachment">
          <Paperclip size={20} />
        </button>

        <div className="flex flex-1 items-center rounded-full bg-white px-4 py-1.5 shadow-[0_1px_2px_rgba(11,27,42,0.05)] transition focus-within:ring-2 focus-within:ring-blue-300/40">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type a message"
            className="max-h-32 w-full resize-none bg-transparent py-1.5 text-[14.5px] leading-[1.35] outline-none placeholder:text-[#94a3b8]"
          />
        </div>

        {trimmed ? (
          <button
            onClick={handleSend}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30 transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/40 active:scale-95"
            title="Send"
          >
            <Send size={20} />
          </button>
        ) : (
          <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30 transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/40 active:scale-95" title="Record">
            <Mic size={20} />
          </button>
        )}
      </div>
    </div>
  )
}
