import { MessageCircle } from 'lucide-react'

export default function EmptyState() {
  return (
    <div className="wallpaper flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-[#00a884] to-[#008069] shadow-2xl shadow-[#00a884]/40">
        <MessageCircle size={52} className="text-white" strokeWidth={1.8} />
      </div>

      <h2 className="mt-8 text-[26px] font-bold tracking-tight text-[#3b4a54]">ChatHub</h2>
      <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-[#667781]">
        Select a conversation from the list, or search for a person on ChatHub to start messaging instantly.
      </p>
    </div>
  )
}