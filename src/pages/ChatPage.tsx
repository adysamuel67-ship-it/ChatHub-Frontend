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
    <div className="flex h-full w-full overflow-hidden bg-[#eef2f7]">
      <div
        className={`w-full md:w-[400px] md:shrink-0 md:border-r md:border-gray-200 ${
          activeUserId ? 'hidden md:block' : ''
        }`}
      >
        <Sidebar />
      </div>
      <div className={`min-w-0 flex-1 ${activeUserId ? '' : 'hidden md:block'}`}>
        <ChatWindow />
      </div>
      <ContactProfile />
    </div>
  )
}