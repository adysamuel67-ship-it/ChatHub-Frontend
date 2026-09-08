import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Phone, Search, Video, MoreVertical, Trash2, MessageSquareText, UserRound } from 'lucide-react'
import { useChatStore } from '../../store/chat'
import Avatar from '../Avatar'

export default function ChatHeader() {
  const active = useChatStore((s) => s.getActiveUser())
  const online = useChatStore((s) => s.online)
  const clearActiveChat = useChatStore((s) => s.clearActiveChat)
  const removeContact = useChatStore((s) => s.removeContact)
  const getContactForUser = useChatStore((s) => s.getContactForUser)
  const setProfileContact = useChatStore((s) => s.setProfileContact)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showMenu) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showMenu])

  if (!active) return null

  const isOnline = online.has(active.user.user_id)
  const contact = getContactForUser(active.user.user_id)

  const handleDelete = async () => {
    setShowMenu(false)
    if (!contact) return
    clearActiveChat()
    await removeContact(contact.contact_id)
  }

  return (
    <div className="flex h-[3.75rem] items-center gap-2 border-b border-gray-200/80 bg-white/90 px-3 backdrop-blur md:px-4">
      <button
        onClick={clearActiveChat}
        className="icon-btn md:hidden"
      >
        <ArrowLeft size={20} />
      </button>

      <Avatar name={active.user.name} size="md" online={isOnline} className="ring-2 ring-emerald-100 rounded-full" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15.5px] font-bold text-[#111b21]">{active.user.name}</p>
        <p className="flex items-center gap-1 truncate text-[12.5px] text-gray-500">
          <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          {isOnline ? 'Online now' : 'Last message · ChatHub'}
        </p>
      </div>

      <div className="flex items-center gap-0.5">
        <button className="icon-btn hidden sm:flex" title="Voice call">
          <Phone size={19} />
        </button>
        <button className="icon-btn hidden sm:flex" title="Video call">
          <Video size={20} />
        </button>
        <button className="icon-btn hidden sm:flex" title="Search in chat">
          <Search size={19} />
        </button>

        <div className="relative" ref={menuRef}>
          <button className="icon-btn" onClick={() => setShowMenu((v) => !v)} title="More">
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="anim-pop absolute right-0 top-full z-50 mt-1.5 w-48 rounded-xl border border-gray-100 bg-white py-1.5 shadow-xl shadow-black/5">
                <div className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-400">
                  <MessageSquareText size={14} />
                  End-to-end encrypted
                </div>
                {contact && (
                  <>
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        setProfileContact(contact)
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-[13.5px] text-[#333f50] hover:bg-gray-50"
                    >
                      <UserRound size={16} className="text-gray-500" />
                      Contact info
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-[13.5px] text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Delete contact
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}