import { MessageSquareText, ShieldCheck, Zap, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const BUBBLES = [
  { text: 'Morning! Are we still on for lunch?', side: 'in', delay: '0s' },
  { text: 'Absolutely 🎉 see you at 12:30', side: 'out', delay: '1.2s' },
  { text: 'Perfect — I booked the rooftop table.', side: 'in', delay: '2.4s' },
] as const

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-dvh bg-[#0B1220]">
      {/* Brand panel */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0B1220] via-[#0F1B33] to-[#0B1220] p-12 lg:flex">
        {/* decorative gradient orbs */}
        <div className="pointer-events-none absolute -left-32 top-[-10%] h-[26rem] w-[26rem] rounded-full bg-blue-600/25 blur-[110px]" />
        <div className="pointer-events-none absolute right-[-15%] bottom-[-10%] h-[24rem] w-[24rem] rounded-full bg-sky-500/20 blur-[110px]" />
        <div className="pointer-events-none absolute left-[40%] top-[45%] h-40 w-40 rounded-full bg-indigo-500/15 blur-[80px]" />

        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg shadow-blue-500/30">
            <MessageSquareText className="h-5.5 w-5.5 text-white" strokeWidth={2.2} />
          </span>
          <span className="text-[22px] font-bold tracking-tight text-white">ChatHub</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3.5 py-1.5 text-[13px] font-medium text-blue-300 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Realtime messaging, zero compromise
          </div>

          <h1 className="text-[2.9rem] font-bold leading-[1.08] tracking-tight text-white">
            Messages that feel
            <span className="bg-gradient-to-r from-blue-300 to-sky-300 bg-clip-text text-transparent"> instant.</span>
          </h1>

          <p className="mt-5 text-[15px] leading-relaxed text-white/60">
            A fast, private place to talk one-on-one — delivered in realtime over a
            secure WebSocket connection.
          </p>

          <ul className="mt-9 space-y-4">
            {[
              { icon: Zap, title: 'Realtime delivery', desc: 'Sent and received as fast as your connection' },
              { icon: ShieldCheck, title: 'Privacy first', desc: 'Threads scoped to you and your contacts only' },
              { icon: Sparkles, title: 'Polished everywhere', desc: 'Responsive and delightful on any screen' },
            ].map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-400/10 bg-blue-500/10 backdrop-blur">
                  <Icon className="h-5 w-5 text-blue-300" />
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-white">{title}</p>
                  <p className="text-[13px] text-white/55">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* animated chat preview */}
        <div className="relative z-10 space-y-3">
          {BUBBLES.map((b) => (
            <div
              key={b.text}
              className={`anim-float w-fit max-w-[75%] rounded-2xl px-4 py-3 backdrop-blur ${
                b.side === 'in'
                  ? 'rounded-tl-sm border border-white/10 bg-white/10 text-white/85'
                  : 'ml-auto rounded-tr-sm bg-gradient-to-r from-blue-500/80 to-sky-500/80 text-white'
              }`}
              style={{ animationDelay: b.delay }}
            >
              <p className="text-[13.5px] leading-snug">{b.text}</p>
              <p className={`mt-1 text-[10.5px] ${b.side === 'in' ? 'text-white/45' : 'text-white/70'}`}>
                12:{String(30 + BUBBLES.indexOf(b) * 7)} PM{' '}
                {b.side === 'in' ? '✓✓' : ''}
              </p>
            </div>
          ))}
        </div>

        <p className="relative text-[13px] text-white/35">&copy; 2026 ChatHub · Whisper systems</p>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-1 flex-col overflow-y-auto bg-[#f1f5f9] sm:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-blue-400/10 blur-[100px]" />

        <div className="flex items-center gap-2.5 px-5 pt-8 lg:hidden">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg shadow-blue-500/30">
            <MessageSquareText className="h-5.5 w-5.5 text-white" strokeWidth={2.2} />
          </span>
          <span className="text-xl font-bold tracking-tight text-[#0B1220]">ChatHub</span>
        </div>

        <div className="anim-fade-up m-auto w-full max-w-[420px] px-5 py-8">{children}</div>
      </div>
    </div>
  )
}
