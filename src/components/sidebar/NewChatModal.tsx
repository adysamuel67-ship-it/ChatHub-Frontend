import { useState, useCallback } from 'react'
import { X, CheckCircle, Info, Loader2, Plus, UserPlus } from 'lucide-react'
import { useChatStore } from '../../store/chat'

interface NewChatModalProps {
  open: boolean
  onClose: () => void
  onAdded?: (userId: number) => void
}

export default function NewChatModal({ open, onClose, onAdded }: NewChatModalProps) {
  const addContact = useChatStore((s) => s.addContact)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'checking' | 'found' | 'not_found'>('idle')
  const [statusName, setStatusName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handlePhoneCheck = useCallback(async () => {
    const trimmed = phone.trim()
    if (!trimmed) return
    setPhoneStatus('checking')
    try {
      const target = await useChatStore.getState().searchUsers(trimmed)
      const match = target.find((u) => u.phone === trimmed) ?? target[0]
      if (match) {
        setStatusName(match.name)
        setPhoneStatus('found')
      } else {
        setPhoneStatus('not_found')
      }
    } catch {
      setPhoneStatus('not_found')
    }
  }, [phone])

  function reset() {
    setName('')
    setPhone('')
    setEmail('')
    setPhoneStatus('idle')
    setStatusName('')
    setError('')
    setDone(false)
  }

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !phone.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const contact = await addContact(name.trim(), phone.trim(), email.trim() || undefined)
      setDone(true)
      setTimeout(() => {
        onClose()
        reset()
        if (contact.user_id && onAdded) onAdded(contact.user_id)
      }, 600)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contact')
    } finally {
      setSubmitting(false)
    }
  }, [name, phone, email, addContact, onAdded, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1a2a]/45 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="anim-pop w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="relative flex items-center justify-center bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <UserPlus size={22} className="text-white" />
          </span>
          <h2 className="ml-3 text-[17px] font-bold text-white">New contact</h2>
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center px-6 py-12">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle size={28} className="text-emerald-600" />
            </span>
            <p className="mt-3 text-[15px] font-bold text-[#111b21]">Contact saved!</p>
            <p className="text-[13px] text-gray-400">Opening conversation…</p>
          </div>
        ) : (
          <div className="px-6 py-5">
            <p className="mb-5 text-[13.5px] leading-relaxed text-gray-500">
              Save a phone number so it shows up in your contacts. If they're on ChatHub you can message them instantly.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[#333f50]">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="Contact name"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[#333f50]">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (phoneStatus !== 'idle' && phoneStatus !== 'checking') setPhoneStatus('idle')
                  }}
                  onBlur={() => void handlePhoneCheck()}
                  className="input"
                  placeholder="+1 234 567 890"
                />
                {phoneStatus === 'checking' && (
                  <div className="flex items-center gap-2 text-[13px] text-gray-400">
                    <Loader2 size={13} className="animate-spin" /> Checking ChatHub…
                  </div>
                )}
                {phoneStatus === 'found' && (
                  <div className="anim-fade-up mt-2 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700">
                    <CheckCircle size={15} className="shrink-0" />
                    <span>
                      <span className="font-semibold">{statusName}</span> is on ChatHub — messaging enabled
                    </span>
                  </div>
                )}
                {phoneStatus === 'not_found' && (
                  <div className="anim-fade-up mt-2 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-[13px] text-gray-500">
                    <Info size={15} className="shrink-0" />
                    Not on ChatHub yet. They can still be saved.
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[#333f50]">
                  Email <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            {error && <p className="mt-3 text-[13px] text-red-600">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting || !name.trim() || !phone.trim()}
              className="btn-primary mt-5 flex w-full items-center justify-center gap-2 py-2.5 text-[14px]"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {submitting ? 'Saving…' : 'Save contact'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}