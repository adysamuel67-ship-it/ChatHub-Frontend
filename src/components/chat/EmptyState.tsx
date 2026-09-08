import { MessageCircle, Zap, ShieldCheck, MonitorSmartphone } from 'lucide-react'

const FEATURES = [
  { icon: Zap, label: 'Realtime delivery' },
  { icon: ShieldCheck, label: 'End-to-end encrypted' },
  { icon: MonitorSmartphone, label: 'Works on any screen' },
]

export default function EmptyState() {
  return (
    <div className="wallpaper flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="relative">
        <div className="absolute -inset-6 rounded-full bg-emerald-400/20 blur-2xl" />
        <span className="relative flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/40">
          <MessageCircle size={44} className="text-white" strokeWidth={1.8} />
        </span>
      </div>

      <h2 className="mt-8 text-[26px] font-bold tracking-tight text-[#111b21]">ChatHub</h2>
      <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-gray-500">
        Select a conversation from the left, or search for a person on ChatHub to start messaging instantly.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {FEATURES.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="flex items-center gap-1.5 rounded-full border border-white bg-white/80 px-3.5 py-1.5 text-[12px] font-semibold text-gray-600 shadow-sm backdrop-blur"
          >
            <Icon size={13} className="text-emerald-600" />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}