import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import {
  Search,
  MessageSquarePlus,
  MoreVertical,
  LogOut,
  MessageCircle,
  X,
  MessageSquare,
  Loader2,
  ChevronRight,
  Plus,
  MessageSquareText,
  User,
} from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { useChatStore } from '../../store/chat'
import Avatar from '../Avatar'
import ConversationItem from './ConversationItem'
import NewChatModal from './NewChatModal'
import type { User as ChatUser } from '../../types'

type Tab = 'chats' | 'contacts'

export default function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const conversations = useChatStore((s) => s.conversations)
  const contacts = useChatStore((s) => s.contacts)
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
  const [searchResults, setSearchResults] = useState<ChatUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [startingChat, setStartingChat] = useState<number | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)

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

  const sortedConversations = useMemo(() => conversations, [conversations])

  const handleStartChat = useCallback(
    async (target: ChatUser) => {
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
      {/* ===== WhatsApp-style green header ===== */}
      <div className="flex shrink-0 items-center justify-between bg-[#00a884] px-3 py-2">
        <button
          onClick={() => setShowNewChatModal(true)}
          className="flex items-center gap-2 rounded-lg px-1 py-1 transition hover:bg-white/10"
          title="ChatHub"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
            <MessageSquareText size={17} className="text-white" strokeWidth={2.2} />
          </span>
          <span className="text-[16px] font-bold tracking-tight text-white">ChatHub</span>
        </button>

        <div className="flex items-center gap-1">
          <button className="icon-btn-light" onClick={() => setShowNewChatModal(true)} title="New chat">
            <MessageSquarePlus size={20} />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button className="icon-btn-light" onClick={() => setShowDropdown((v) => !v)} title="Menu">
              <MoreVertical size={20} />
            </button>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="anim-pop absolute right-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-[#e9edef] bg-white py-1.5 shadow-2xl shadow-black/20">
                  <div className="flex items-center gap-2.5 border-b border-[#e9edef] px-3 py-2.5">
                    <Avatar name={user?.name} size="xs" />
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-semibold text-[#111b21]">{user?.name ?? '…'}</p>
                      <p className="truncate text-[11.5px] text-[#8696a0]">{user?.phone}</p>
                    </div>
                  </div>
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
      <div className="border-b border-[#e9edef] bg-white px-3 py-2">
        <div className="flex items-center gap-2.5 rounded-lg bg-[#f0f2f5] px-3 py-2">
          <Search size={16} className="shrink-0 text-[#8696a0]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search or start a new chat"
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-[#8696a0]"
          />
          {searchActive && (
            <button onClick={() => handleQueryChange('')} className="text-[#8696a0] transition hover:text-[#111b21]">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ===== Tabs ===== */}
      {!searchActive && (
        <div className="flex border-b border-[#e9edef] bg-white">
          {(
            [
              { id: 'chats', label: 'Chats', icon: MessageCircle },
              { id: 'contacts', label: 'Contacts', icon: User },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative flex items-center justify-center gap-1.5 px-5 py-3 text-[14px] font-medium transition-all ${
                tab === id ? 'text-[#008069]' : 'text-[#8696a0] hover:text-[#111b21]'
              }`}
            >
              <Icon size={16} />
              {label}
              {tab === id && <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-[#008069]" />}
            </button>
          ))}
        </div>
      )}

      {/* ===== Body ===== */}
      <div className="flex-1 overflow-y-auto bg-white">
        {isLoading && !searchActive ? (
          <div className="space-y-0">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3.5">
                <div className="skeleton h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3.5 w-2/3 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : searchActive ? (
          /* ---- search results ---- */
          <div className="anim-fade-up">
            {isSearching && searchResults.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-[#8696a0]">
                <Loader2 size={22} className="animate-spin" />
                <p className="mt-2 text-[13px]">Searching ChatHub…</p>
              </div>
            ) : (
              <>
                {sortedConversations.length > 0 && (
                  <>
                    <p className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-[#8696a0]">Chats</p>
                    {sortedConversations.map((c) => (
                      <ConversationItem
                        key={c.user.user_id}
                        conversation={c}
                        active={activeUserId === c.user.user_id}
                        onClick={() => openChat(c.user.user_id)}
                      />
                    ))}
                  </>
                )}

                {searchResults.length > 0 && (
                  <>
                    <p className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-[#8696a0]">
                      People on ChatHub
                    </p>
                    {searchResults.map((u) => {
                      const busy = startingChat === u.user_id
                      const existing = conversations.find((c) => c.user.user_id === u.user_id)
                      const savedContact = getContactForUser(u.user_id)
                      return (
                        <div
                          key={u.user_id}
                          className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#f5f6f6]"
                        >
                          <Avatar name={u.name} size="md" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[15px] font-medium text-[#111b21]">{u.name}</p>
                            <p className="truncate text-[13px] text-[#667781]">
                              {u.phone}
                              {savedContact && <span className="ml-1.5 text-[#008069]">· in contacts</span>}
                            </p>
                          </div>
                          <button
                            onClick={() => handleStartChat(u)}
                            disabled={busy}
                            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#00a884]/10 px-3 py-1.5 text-[12.5px] font-semibold text-[#008069] transition hover:bg-[#00a884]/20 disabled:opacity-60"
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
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0f2f5]">
                      <Search size={22} className="text-[#8696a0]" />
                    </span>
                    <p className="mt-3 text-[14.5px] font-semibold text-[#111b21]">No results for “{query.trim()}”</p>
                    <p className="mt-1 max-w-[240px] text-[12.5px] text-[#8696a0]">
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
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f2f5]">
                <MessageCircle size={26} className="text-[#00a884]" />
              </span>
              <p className="mt-4 text-[16px] font-bold text-[#111b21]">No conversations yet</p>
              <p className="mt-1 max-w-[250px] text-[13.5px] text-[#667781]">
                Message someone on ChatHub to start a thread.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="btn-primary mt-5 flex items-center gap-2 px-5 py-2 text-[13.5px]"
              >
                <Plus size={16} /> Start a chat
              </button>
            </div>
          ) : (
            <div>
              {sortedConversations.map((c) => (
                <ConversationItem
                  key={c.user.user_id}
                  conversation={c}
                  active={activeUserId === c.user.user_id}
                  onClick={() => openChat(c.user.user_id)}
                />
              ))}
            </div>
          )
        ) : (
          /* ---- contacts list ---- */
          contacts.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f2f5]">
                <User size={26} className="text-[#00a884]" />
              </span>
              <p className="mt-4 text-[16px] font-bold text-[#111b21]">No contacts saved</p>
              <p className="mt-1 max-w-[250px] text-[13.5px] text-[#667781]">
                Save phone numbers here so you can start conversations with them.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="btn-primary mt-5 flex items-center gap-2 px-5 py-2 text-[13.5px]"
              >
                <Plus size={16} /> Add a contact
              </button>
            </div>
          ) : (
            <div>
              {contacts.map((c) => {
                const cid = c.user_id
                return (
                  <div
                    key={c.contact_id}
                    className="group flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#f5f6f6]"
                    onClick={() => setProfileContact(c)}
                  >
                    <Avatar name={c.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium text-[#111b21]">{c.name}</p>
                      <p className="truncate text-[13px] text-[#667781]">{c.phone}</p>
                    </div>
                    {cid != null ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          void openChat(cid)
                        }}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#00a884]/10 px-2.5 py-1.5 text-[12.5px] font-semibold text-[#008069] transition hover:bg-[#00a884]/20"
                      >
                        <MessageSquare size={13} /> Message
                      </button>
                    ) : (
                      <span className="shrink-0 rounded-full bg-[#f0f2f5] px-2.5 py-1 text-[11px] font-medium text-[#8696a0]">
                        Not on ChatHub
                      </span>
                    )}
                    <ChevronRight size={16} className="shrink-0 text-[#c8ced3] transition group-hover:text-[#667781]" />
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>

      {/* ===== Modals ===== */}
      <NewChatModal open={showNewChatModal} onClose={() => setShowNewChatModal(false)} onAdded={openChat} />
    </div>
  )
}