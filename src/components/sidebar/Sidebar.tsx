import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import {
  Search,
  MessageSquarePlus,
  MoreVertical,
  LogOut,
  UserCircle,
  Users,
  MessageCircle,
  X,
  MessageSquare,
  Loader2,
  ChevronRight,
  Plus,
} from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { useChatStore } from '../../store/chat'
import Avatar from '../Avatar'
import ConversationItem from './ConversationItem'
import NewChatModal from './NewChatModal'
import ProfilePanel from './ProfilePanel'
import type { User } from '../../types'

type Tab = 'chats' | 'contacts'

export default function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const conversations = useChatStore((s) => s.conversations)
  const contacts = useChatStore((s) => s.contacts)
  const online = useChatStore((s) => s.online)
  const activeUserId = useChatStore((s) => s.activeUserId)
  const isLoading = useChatStore((s) => s.isLoading)
  const loadConversations = useChatStore((s) => s.loadConversations)
  const openChat = useChatStore((s) => s.openChat)
  const searchUsers = useChatStore((s) => s.searchUsers)
  const addContact = useChatStore((s) => s.addContact)
  const getContactForUser = useChatStore((s) => s.getContactForUser)
  const setProfileContact = useChatStore((s) => s.setProfileContact)

  const [tab, setTab] = useState<Tab>('chats')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [startingChat, setStartingChat] = useState<number | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [showProfilePanel, setShowProfilePanel] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const searchActive = query.trim().length > 0

  // live server-side search (debounced)
  useEffect(() => {
    const q = query.trim()
    if (!q) return
    const t = setTimeout(async () => {
      const results = await searchUsers(q)
      setSearchResults(results)
      setIsSearching(false)
    }, 250)
    return () => clearTimeout(t)
  }, [query, searchUsers])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (!value.trim()) {
      setSearchResults([])
      setIsSearching(false)
    } else if (value !== query) {
      setIsSearching(true)
    }
  }

  const appliedSearch = searchActive ? query.trim() : ''

  // conversations are server-filtered via the same query
  useEffect(() => {
    void loadConversations(appliedSearch)
  }, [appliedSearch, loadConversations])

  useEffect(() => {
    if (!showDropdown) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showDropdown])

  const onlineCount = useMemo(
    () => conversations.filter((c) => online.has(c.user.user_id)).length,
    [conversations, online],
  )

  const sortedConversations = useMemo(() => {
    const totalUsers = online.size
    void totalUsers
    return conversations
  }, [conversations, online])

  const handleStartChat = useCallback(
    async (target: User) => {
      const existing = conversations.find((c) => c.user.user_id === target.user_id)
      if (existing) {
        await openChat(target.user_id)
        return
      }
      setStartingChat(target.user_id)
      try {
        await addContact(target.name, target.phone)
      } catch {
        // already a contact — still allow the chat
      }
      await openChat(target.user_id)
      await loadConversations('')
      setQuery('')
      setSearchResults([])
      setTab('chats')
    },
    [conversations, openChat, addContact, loadConversations],
  )

  return (
    <div className="flex h-full flex-col bg-white">
      {/* ===== Header ===== */}
      <div className="flex shrink-0 flex-col border-b border-gray-100 bg-gradient-to-b from-white to-[#fafcfe] px-4 pb-2 pt-3.5">
        <div className="flex items-center justify-between">
          <button onClick={() => setShowProfilePanel(true)} className="group flex items-center gap-3">
            <Avatar name={user?.name} size="sm" online className="ring-2 ring-emerald-100" />
            <div className="text-left">
              <p className="text-[14.5px] font-bold leading-tight text-[#111b21]">{user?.name ?? '…'}</p>
              <p className="flex items-center gap-1 text-[12px] text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-ring" />
                {onlineCount > 0 ? `${onlineCount} ${onlineCount === 1 ? 'contact' : 'contacts'} online` : 'Online'}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1">
            <button className="icon-btn" onClick={() => setShowNewChatModal(true)} title="New chat">
              <MessageSquarePlus size={20} />
            </button>

            <div className="relative" ref={dropdownRef}>
              <button className="icon-btn" onClick={() => setShowDropdown((v) => !v)} title="Menu">
                <MoreVertical size={20} />
              </button>
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                  <div className="anim-pop absolute right-0 top-full z-50 mt-1.5 w-44 rounded-xl border border-gray-100 bg-white py-1.5 shadow-xl shadow-black/5">
                    <button
                      onClick={() => {
                        setShowDropdown(false)
                        setShowProfilePanel(true)
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-[13.5px] text-[#333f50] hover:bg-gray-50"
                    >
                      <UserCircle size={16} className="text-gray-500" /> Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false)
                        logout()
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-[13.5px] text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ===== Search ===== */}
        <div className="relative mt-3">
          <div className="flex items-center gap-2.5 rounded-xl bg-[#eef2f7] px-3.5 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-400/30 transition-all">
            <Search size={16} className="shrink-0 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search chats & people on ChatHub"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-gray-400"
            />
            {searchActive && (
              <button onClick={() => handleQueryChange('')} className="text-gray-400 transition hover:text-gray-600">
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* ===== Tabs ===== */}
        {!searchActive && (
          <div className="mt-2.5 grid grid-cols-2 gap-1 rounded-lg bg-[#eef2f7] p-1">
            {(
              [
                { id: 'chats', label: 'Chats', icon: MessageCircle },
                { id: 'contacts', label: 'Contacts', icon: Users },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-semibold transition-all ${
                  tab === id ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== Body ===== */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && !searchActive ? (
          <div className="space-y-0 p-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-3">
                <div className="skeleton h-11 w-11 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3.5 w-2/3 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : searchActive ? (
          /* ---- search results ---- */
          <div className="anim-fade-up p-2">
            {isSearching && searchResults.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-gray-400">
                <Loader2 size={22} className="animate-spin" />
                <p className="mt-2 text-[13px]">Searching ChatHub…</p>
              </div>
            ) : (
              <>
                {sortedConversations.length > 0 && (
                  <>
                    <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">Chats</p>
                    {sortedConversations.map((c) => (
                      <ConversationItem
                        key={c.user.user_id}
                        conversation={c}
                        active={activeUserId === c.user.user_id}
                        online={online.has(c.user.user_id)}
                        onClick={() => openChat(c.user.user_id)}
                      />
                    ))}
                  </>
                )}

                {searchResults.length > 0 && (
                  <>
                    <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      People on ChatHub
                    </p>
                    {searchResults.map((u) => {
                      const busy = startingChat === u.user_id
                      const existing = conversations.find((c) => c.user.user_id === u.user_id)
                      const savedContact = getContactForUser(u.user_id)
                      return (
                        <div
                          key={u.user_id}
                          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50"
                        >
                          <Avatar name={u.name} size="md" online={online.has(u.user_id)} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14.5px] font-semibold text-[#111b21]">{u.name}</p>
                            <p className="truncate text-[12.5px] text-gray-500">
                              {u.phone}
                              {savedContact && <span className="ml-1.5 text-emerald-600">· in contacts</span>}
                            </p>
                          </div>
                          <button
                            onClick={() => handleStartChat(u)}
                            disabled={busy}
                            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-[12.5px] font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                          >
                            {busy ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : existing ? (
                              <MessageSquare size={13} />
                            ) : (
                              <Plus size={13} />
                            )}
                            {existing ? 'Open' : 'Message'}
                          </button>
                        </div>
                      )
                    })}
                  </>
                )}

                {!isSearching && sortedConversations.length === 0 && searchResults.length === 0 && (
                  <div className="flex flex-col items-center py-16 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                      <Search size={24} className="text-gray-400" />
                    </span>
                    <p className="mt-3 text-[14px] font-semibold text-[#333f50]">No results for “{query.trim()}”</p>
                    <p className="mt-1 max-w-[240px] text-[12.5px] text-gray-400">
                      Try a different name or phone number. Only people already on ChatHub can be messaged.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : tab === 'chats' ? (
          /* ---- chats list ---- */
          conversations.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100">
                <MessageCircle size={28} className="text-emerald-600" />
              </span>
              <p className="mt-4 text-[15px] font-bold text-[#111b21]">No conversations yet</p>
              <p className="mt-1 max-w-[240px] text-[13px] text-gray-400">
                Message someone on ChatHub to start a thread. Search above or add a contact to get going.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="btn-primary mt-5 flex items-center gap-2 px-4 py-2 text-[13.5px]"
              >
                <Plus size={16} /> Add contact
              </button>
            </div>
          ) : (
            <div className="p-2">
              {sortedConversations.map((c) => (
                <ConversationItem
                  key={c.user.user_id}
                  conversation={c}
                  active={activeUserId === c.user.user_id}
                  online={online.has(c.user.user_id)}
                  onClick={() => openChat(c.user.user_id)}
                />
              ))}
            </div>
          )
        ) : (
          /* ---- contacts list ---- */
          contacts.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-100 to-indigo-100">
                <Users size={28} className="text-sky-600" />
              </span>
              <p className="mt-4 text-[15px] font-bold text-[#111b21]">No contacts saved</p>
              <p className="mt-1 max-w-[240px] text-[13px] text-gray-400">
                Save phone numbers here so you can start conversations with them.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="btn-primary mt-5 flex items-center gap-2 px-4 py-2 text-[13.5px]"
              >
                <Plus size={16} /> Add a contact
              </button>
            </div>
          ) : (
            <div className="p-2">
              {contacts.map((c) => {
                const cid = c.user_id
                return (
                  <div
                    key={c.contact_id}
                    className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                    onClick={() => setProfileContact(c)}
                  >
                    <Avatar name={c.name} size="md" online={cid != null && online.has(cid)} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-semibold text-[#111b21]">{c.name}</p>
                      <p className="truncate text-[12.5px] text-gray-500">{c.phone}</p>
                    </div>
                    {cid != null ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          void openChat(cid)
                        }}
                        className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[12.5px] font-semibold text-emerald-700 transition group-hover:bg-emerald-100"
                      >
                        <MessageSquare size={13} /> Message
                      </button>
                    ) : (
                      <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">
                        Not on ChatHub
                      </span>
                    )}
                    <ChevronRight size={16} className="shrink-0 text-gray-300 transition group-hover:text-gray-500" />
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>

      {/* ===== Modals ===== */}
      <NewChatModal open={showNewChatModal} onClose={() => setShowNewChatModal(false)} onAdded={openChat} />
      <ProfilePanel open={showProfilePanel} onClose={() => setShowProfilePanel(false)} />
    </div>
  )
}