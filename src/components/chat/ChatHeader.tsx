import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Phone, Search, Video, MoreVertical, Trash2, UserRound, Lock } from 'lucide-react'
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
    <div className="flex h-[3.75rem] shrink-0 items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 px-3 md:px-4">
      <button onClick={clearActiveChat} className="icon-btn-light md:hidden">
        <ArrowLeft size={20} />
      </button>

      <Avatar
        name={active.user.name}
        size="sm"
        className="ring-2 ring-white/25 rounded-full"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-medium text-white">{active.user.name}</p>
        <p className="flex items-center gap-1 truncate text-[13px] text-sky-300">
          {isOnline ? 'online' : 'last seen recently'}
        </p>
      </div>

      <div className="flex items-center gap-0.5">
        <button className="icon-btn-light hidden sm:flex" title="Voice call">
          <Phone size={19} />
        </button>
        <button className="icon-btn-light hidden sm:flex" title="Video call">
          <Video size={20} />
        </button>
        <button className="icon-btn-light hidden sm:flex" title="Search in chat">
          <Search size={19} />
        </button>

        <div className="relative" ref={menuRef}>
          <button className="icon-btn-light" onClick={() => setShowMenu((v) => !v)} title="More">
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="anim-pop absolute right-0 top-full z-50 mt-1.5 w-52 rounded-lg border border-[#e2e8f0] bg-white py-1.5 shadow-2xl shadow-black/20">
                <div className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#94a3b8]">
                  <Lock size={14} />
                  End-to-end encrypted
                </div>
                <div className="h-px bg-[#e2e8f0]" />
                <button
                  onClick={() => {
                    setShowMenu(false)
                    if (contact) setProfileContact(contact)
                  }}
                  disabled={!contact}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[13.5px] text-[#0f172a] hover:bg-[#f8fafc] disabled:opacity-50"
                >
                  <UserRound size={16} className="text-[#94a3b8]" />
                  Contact info
                </button>
                {contact && (
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-[13.5px] text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Delete contact
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
