import { useEffect } from 'react'
import { useChatStore } from '../store/chat'
import Sidebar from '../components/sidebar/Sidebar'
import ChatWindow from '../components/chat/ChatWindow'
import ContactProfile from '../components/chat/ContactProfile'

export default function ChatPage() {
  const loadContacts = useChatStore((s) => s.loadContacts)
  const loadConversations = useChatStore((s) => s.loadConversations)
  const activeUserId = useChatStore((s) => s.activeUserId)

  useEffect(() => {
    void loadConversations()
    void loadContacts()
  }, [loadConversations, loadContacts])

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#efeae2]">
      {/* WhatsApp-style green header band */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[127px] bg-[#00a884]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1800px] justify-center">
        <div
          className={`flex w-full flex-col md:w-[420px] md:shrink-0 md:border-r md:border-[#d1d7db] ${
            activeUserId ? 'hidden md:flex' : ''
          }`}
        >
          <Sidebar />
        </div>
        <div className={`min-w-0 flex-1 ${activeUserId ? '' : 'hidden md:block'}`}>
          <ChatWindow />
        </div>
      </div>

      <ContactProfile />
    </div>
  )
}