import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { Eye, EyeOff, Loader2, Phone, Lock, User, Mail, Check, ChevronDown } from 'lucide-react'
import AuthLayout from './AuthLayout'

function Rule({ met, children }: { met: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-center gap-2 text-xs transition ${met ? 'text-blue-600' : 'text-slate-400'}`}>
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full transition ${
          met ? 'bg-blue-500 text-white' : 'bg-slate-200 text-transparent'
        }`}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      {children}
    </li>
  )
}

export default function Signup() {
  const navigate = useNavigate()
  const signUp = useAuthStore((s) => s.signUp)
  const loginAfterSignUp = useAuthStore((s) => s.loginAfterSignUp)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({ name: false, phone: false, password: false, confirm: false })

  const phoneDigits = phone.replace(/\D/g, '')
  const phoneValid = phoneDigits.length >= 8

  const rules = useMemo(
    () => ({
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasDigit: /\d/.test(password),
    }),
    [password],
  )
  const allRulesMet = rules.minLength && rules.hasUpper && rules.hasLower && rules.hasDigit
  const confirmValid = confirmPassword.length > 0 && confirmPassword === password

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ name: true, phone: true, password: true, confirm: true })
    if (!name.trim() || !phoneValid || !allRulesMet || !confirmValid) return

    setError('')
    setLoading(true)
    try {
      await signUp(name.trim(), phone, password, email || undefined)
      await loginAfterSignUp(phone, password)
      navigate('/')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign up failed. Please try again.'
      setError(msg.includes('already') ? 'An account with this phone number already exists. Please log in.' : msg)
    } finally {
      setLoading(false)
    }
  }

  const metCount = Object.values(rules).filter(Boolean).length

  return (
    <AuthLayout>
      <div className="card p-6 sm:p-8">
        <h2 className="text-[22px] font-bold tracking-tight text-[#0B1220]">Create your account</h2>
        <p className="mt-1 text-[14.5px] text-[#64748b]">Join ChatHub and start messaging in minutes</p>

        {error && (
          <div className="anim-fade-up mt-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13.5px] text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="signup-name" className="mb-1.5 block text-[13.5px] font-semibold text-[#1e293b]">
              Full name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder="Your full name"
                className="input !pl-11"
              />
            </div>
            {touched.name && !name.trim() && <p className="mt-1.5 text-xs text-red-600">Name is required.</p>}
          </div>

          <div>
            <label htmlFor="signup-phone" className="mb-1.5 block text-[13.5px] font-semibold text-[#1e293b]">
              Phone
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
              <input
                id="signup-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                placeholder="Enter your phone number"
                className="input !pl-11"
              />
            </div>
            {touched.phone && !phoneValid && (
              <p className="mt-1.5 text-xs text-red-600">Please enter a valid phone number.</p>
            )}
          </div>

          <div>
            <label htmlFor="signup-email" className="mb-1.5 block text-[13.5px] font-semibold text-[#1e293b]">
              Email <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input !pl-11"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-password" className="mb-1.5 block text-[13.5px] font-semibold text-[#1e293b]">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (e.target.value) setShowRules(true)
                }}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="Create a password"
                className="input !pl-11 !pr-11"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 transition hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowRules((v) => !v)}
              className="mt-1.5 flex items-center gap-1 text-xs font-medium text-[#64748b] transition hover:text-[#1e293b]"
            >
              Password strength {metCount}/4
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showRules ? 'rotate-180' : ''}`} />
            </button>
            {showRules && (
              <ul className="anim-fade-up mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-xl bg-white p-3 ring-1 ring-slate-100">
                <Rule met={rules.minLength}>8+ characters</Rule>
                <Rule met={rules.hasUpper}>Uppercase</Rule>
                <Rule met={rules.hasLower}>Lowercase</Rule>
                <Rule met={rules.hasDigit}>Number</Rule>
              </ul>
            )}
          </div>

          <div>
            <label htmlFor="signup-confirm" className="mb-1.5 block text-[13.5px] font-semibold text-[#1e293b]">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
              <input
                id="signup-confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                placeholder="Re-enter your password"
                className="input !pl-11 !pr-11"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 transition hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
            {touched.confirm && confirmPassword.length > 0 && !confirmValid && (
              <p className="mt-1.5 text-xs text-red-600">Passwords do not match.</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary h-11 w-full text-[15px]">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account…
              </span>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[13.5px] text-[#64748b]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
