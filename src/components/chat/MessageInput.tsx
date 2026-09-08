import { Smile, Send, Paperclip } from 'lucide-react'
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
    <div className="relative">
      {showEmoji && (
        <div
          ref={emojiRef}
          className="anim-pop absolute bottom-full right-3 z-50 mb-2 w-[19rem] rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl shadow-black/10"
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
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[19px] transition hover:bg-gray-100"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-end gap-1.5 bg-white/95 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur md:px-4">
        <button
          onClick={() => setShowEmoji((v) => !v)}
          className={`icon-btn shrink-0 ${showEmoji ? '!text-emerald-600 !bg-emerald-50' : ''}`}
          title="Emoji"
        >
          <Smile size={22} />
        </button>

        <button className="icon-btn shrink-0 hidden sm:flex" title="Attachment">
          <Paperclip size={20} />
        </button>

        <div className="flex flex-1 items-center rounded-full bg-[#eef2f7] px-4 transition focus-within:ring-2 focus-within:ring-emerald-400/30">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type a message"
            className="max-h-32 w-full resize-none bg-transparent py-2.5 text-[14.5px] leading-[1.35] outline-none placeholder:text-gray-400"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!trimmed}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 hover:brightness-105 disabled:opacity-40 disabled:shadow-none"
        >
          <Send size={19} />
        </button>
      </div>
    </div>
  )
}