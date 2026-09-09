import { useEffect } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import { useChatStore } from './store/chat'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ChatPage from './pages/ChatPage'
import { MessageSquareText } from 'lucide-react'

function Splash() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#0B1220]">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg shadow-blue-500/40">
        <MessageSquareText className="h-7 w-7 text-white" strokeWidth={2.2} />
      </span>
      <p className="animate-pulse text-[13px] font-medium text-white/50">Connecting you…</p>
    </div>
  )
}

function Protected({ children }: { children: React.ReactNode }) {
  const { user, accessToken, isLoading } = useAuthStore()
  if (isLoading) return <Splash />
  if (!user || !accessToken) return <Navigate to="/login" replace />
  return <>{children}</>
}

function Guest({ children }: { children: React.ReactNode }) {
  const { user, accessToken, isLoading } = useAuthStore()
  if (isLoading) return <Splash />
  if (user && accessToken) return <Navigate to="/" replace />
  return <>{children}</>
}

function AuthGate() {
  const { user, accessToken } = useAuthStore()
  const connectSocket = useChatStore((s) => s.connectSocket)
  const disconnectSocket = useChatStore((s) => s.disconnectSocket)
  const loadConversations = useChatStore((s) => s.loadConversations)
  const loadContacts = useChatStore((s) => s.loadContacts)
  const navigate = useNavigate()

  useEffect(() => {
    void useAuthStore.getState().init()

    if (user && accessToken) {
      connectSocket()
      void loadConversations()
      void loadContacts()
    } else {
      disconnectSocket()
    }

    const onUnauthorized = () => {
      useAuthStore.getState().logout()
      navigate('/login')
    }
    window.addEventListener('chathub:unauthorized', onUnauthorized)
    return () => {
      window.removeEventListener('chathub:unauthorized', onUnauthorized)
      disconnectSocket()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id, accessToken])

  return null
}

export default function App() {
  return (
    <div className="h-full">
      <AuthGate />
      <Routes>
        <Route
          path="/login"
          element={
            <Guest>
              <Login />
            </Guest>
          }
        />
        <Route
          path="/signup"
          element={
            <Guest>
              <Signup />
            </Guest>
          }
        />
        <Route
          path="/*"
          element={
            <Protected>
              <ChatPage />
            </Protected>
          }
        />
      </Routes>
    </div>
  )
}
