import { useState, useCallback } from 'react'
import { ArrowLeft, Pencil, Loader2, LogOut, Mail, Phone, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import Avatar from '../Avatar'
import { formatPhone } from '../../lib/utils'

interface ProfilePanelProps {
  open: boolean
  onClose: () => void
}

export default function ProfilePanel({ open, onClose }: ProfilePanelProps) {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const logout = useAuthStore((s) => s.logout)

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = useCallback(async () => {
    setSaving(true)
    setError('')
    try {
      await updateUser({ name: name.trim(), email: email.trim() || undefined })
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes')
    } finally {
      setSaving(false)
    }
  }, [name, email, updateUser])

  if (!open || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-[#0b1a2a]/40 backdrop-blur-sm" onClick={onClose} />

      <div className="anim-fade-up relative flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
        {/* cover header */}
        <div className="relative h-24 shrink-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,.5), transparent 50%)' }} />
          <button onClick={onClose} className="absolute left-4 top-5 icon-btn !bg-white/15 !text-white hover:!bg-white/25">
            <ArrowLeft size={20} />
          </button>
          <h2 className="absolute bottom-4 left-5 text-[18px] font-bold text-white">Profile</h2>
        </div>

        <div className="relative z-10 -mt-10 flex justify-center">
          <Avatar name={user.name} size="lg" ring />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8">
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setName(user.name)
                setEmail(user.email ?? '')
                setEditing(true)
              }}
              className="group inline-flex items-center justify-center gap-1.5 transition"
            >
              <span className="text-[19px] font-bold text-[#111b21]">{user.name}</span>
              {!editing && <Pencil size={14} className="text-gray-300 transition group-hover:text-emerald-600" />}
            </button>
            <p className="mt-0.5 text-[13px] text-gray-500">{formatPhone(user.phone)}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11.5px] font-semibold text-emerald-700">
              <ShieldCheck size={13} /> Verified member
            </span>
          </div>

          {error && <p className="mt-4 text-[13px] text-red-600">{error}</p>}

          {editing ? (
            <div className="anim-fade-up card mt-5 space-y-4 p-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[#333f50]">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[#333f50]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="email@example.com"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2 text-[13.5px] font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim()}
                  className="btn-primary flex flex-1 items-center justify-center gap-2 py-2 text-[13.5px]"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="card mt-5 divide-y divide-gray-50">
              {[
                { icon: ShieldCheck, label: 'Phone', value: formatPhone(user.phone), tone: 'text-emerald-600 bg-emerald-50' },
                { icon: Mail, label: 'Email', value: user.email || '—', tone: 'text-sky-600 bg-sky-50' },
                { icon: Phone, label: 'Member since', value: new Date(user.created_at).toLocaleDateString([], { month: 'long', year: 'numeric' }), tone: 'text-violet-600 bg-violet-50' },
              ].map(({ icon: Icon, label, value, tone }) => (
                <div key={label} className="flex items-center gap-3 p-3.5">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11.5px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                    <p className="truncate text-[14px] font-medium text-[#111b21]">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={logout}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-2.5 text-[14px] font-semibold text-red-600 transition hover:bg-red-100"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}