import { useEffect, useState } from 'react'
import { ChevronRight, Loader2, Mail, MessageSquare, Phone, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { useChatStore } from '../../store/chat'
import { useAuthStore } from '../../store/auth'
import { api } from '../../lib/api'
import Avatar from '../Avatar'
import { formatPhone } from '../../lib/utils'
import type { Contact, User } from '../../types'

export default function ContactProfile() {
  const contact = useChatStore((s) => s.profileContact)
  if (!contact) return null
  return <ContactProfileView key={contact.contact_id} contact={contact} onClose={() => useChatStore.getState().setProfileContact(null)} />
}

function ContactProfileView({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  const online = useChatStore((s) => s.online)
  const activeUserId = useChatStore((s) => s.activeUserId)
  const removeContact = useChatStore((s) => s.removeContact)
  const clearActiveChat = useChatStore((s) => s.clearActiveChat)
  const openChat = useChatStore((s) => s.openChat)
  const currentUserId = useAuthStore((s) => s.user?.user_id)

  const [profile, setProfile] = useState<User | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(contact.user_id != null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (contact.user_id == null) return
    let cancelled = false
    api
      .getCurrentUser(contact.user_id)
      .then((u) => !cancelled && setProfile(u))
      .catch(() => !cancelled && setProfile(null))
      .finally(() => !cancelled && setLoadingProfile(false))
    return () => {
      cancelled = true
    }
  }, [contact.user_id])

  const onChatHub = contact.user_id != null
  const isOnline = onChatHub && online.has(contact.user_id as number)
  const isSelf = currentUserId === contact.user_id

  const handleMessage = async () => {
    if (contact.user_id == null) return
    onClose()
    await openChat(contact.user_id)
  }

  const handleDelete = async () => {
    if (contact.contact_id <= 0) return
    setDeleting(true)
    setError('')
    try {
      await removeContact(contact.contact_id)
      if (activeUserId === contact.user_id) clearActiveChat()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete contact')
    } finally {
      setDeleting(false)
    }
  }

  const infoRows: { label: string; value: string }[] = []
  infoRows.push({ label: 'Phone', value: formatPhone(contact.phone) })
  if (contact.email) infoRows.push({ label: 'Email', value: contact.email })
  if (profile?.email && profile.email !== contact.email) infoRows.push({ label: 'Email', value: profile.email })
  infoRows.push({ label: 'Added to contacts', value: new Date(contact.created_at).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' }) })
  if (profile?.created_at) {
    infoRows.push({ label: 'Member since', value: new Date(profile.created_at).toLocaleDateString([], { month: 'long', year: 'numeric' }) })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-[#0B1220]/40 backdrop-blur-sm" onClick={onClose} />

      <div className="anim-fade-up relative flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
        <div className="relative h-24 shrink-0 bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,.5), transparent 50%)' }} />
          <button onClick={onClose} className="absolute left-4 top-5 icon-btn !bg-white/15 !text-white hover:!bg-white/25">
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <h2 className="absolute bottom-4 left-5 text-[18px] font-bold text-white">Contact info</h2>
        </div>

        <div className="relative z-10 -mt-10 flex justify-center">
          <Avatar name={contact.name} size="lg" ring online={isOnline} />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8">
          <div className="mt-4 text-center">
            <p className="text-[19px] font-bold text-[#0f172a]">{contact.name}</p>
            <p className="mt-0.5 text-[13px] text-gray-500">{formatPhone(contact.phone)}</p>
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
              {isOnline ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11.5px] font-semibold text-blue-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Online now
                </span>
              ) : onChatHub ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11.5px] font-semibold text-blue-700">
                  <ShieldCheck size={13} /> On ChatHub
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-[11.5px] font-semibold text-gray-500">
                  <UserRound size={13} /> Not on ChatHub
                </span>
              )}
            </div>
          </div>

          <div className="card mt-5 divide-y divide-slate-50">
            {infoRows.map((row, i) => (
              <div key={`${row.label}-${i}`} className="flex items-center gap-3 p-3.5">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    row.label === 'Phone'
                      ? 'bg-blue-50 text-blue-600'
                      : row.label === 'Email'
                        ? 'bg-sky-50 text-sky-600'
                        : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  {row.label === 'Phone' ? <Phone size={18} /> : row.label === 'Email' ? <Mail size={18} /> : <UserRound size={18} />}
                </span>
                <div className="min-w-0">
                  <p className="text-[11.5px] font-semibold uppercase tracking-wide text-gray-400">{row.label}</p>
                  <p className="truncate text-[14px] font-medium text-[#0f172a]">{row.value}</p>
                </div>
              </div>
            ))}
            {profile && profile.is_verified && (
              <div className="flex items-center gap-3 p-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShieldCheck size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11.5px] font-semibold uppercase tracking-wide text-gray-400">Status</p>
                  <p className="text-[14px] font-medium text-[#0f172a]">Verified member</p>
                </div>
              </div>
            )}
            {loadingProfile && (
              <div className="flex items-center justify-center gap-2 p-4 text-[13px] text-gray-400">
                <Loader2 size={15} className="animate-spin" /> Loading profile…
              </div>
            )}
          </div>

          {error && <p className="mt-4 text-[13px] text-red-600">{error}</p>}

          <div className="mt-5 space-y-2.5">
            {onChatHub && !isSelf && (
              <button onClick={handleMessage} className="btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-[14px]">
                <MessageSquare size={16} /> Message
              </button>
            )}
            {contact.contact_id > 0 && !isSelf && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-2.5 text-[14px] font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Delete contact
              </button>
            )}
            {!onChatHub && !isSelf && (
              <p className="flex items-center justify-center gap-1 text-[12.5px] text-gray-400">
                <ChevronRight size={13} className="rotate-90" /> Invite them to ChatHub to start chatting
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
