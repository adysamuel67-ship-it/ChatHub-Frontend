import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { Eye, EyeOff, Loader2, Phone, Lock } from 'lucide-react'
import AuthLayout from './AuthLayout'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({ phone: false })

  const phoneDigits = phone.replace(/\D/g, '')
  const phoneValid = phoneDigits.length >= 8
  const showPhoneError = touched.phone && !phoneValid

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched((t) => ({ ...t, phone: true }))
    if (!phoneValid) return

    setError('')
    setLoading(true)
    try {
      await login(phone, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="card p-7 sm:p-8">
        <h2 className="text-[22px] font-bold tracking-tight text-[#0B1220]">Welcome back</h2>
        <p className="mt-1 text-[14.5px] text-[#64748b]">Sign in to continue to your messages</p>

        {error && (
          <div className="anim-fade-up mt-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13.5px] text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-phone" className="mb-1.5 block text-[13.5px] font-semibold text-[#1e293b]">
              Phone
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
              <input
                id="login-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                placeholder="Enter your phone number"
                className="input !pl-11"
              />
            </div>
            {showPhoneError && <p className="mt-1.5 text-xs text-red-600">Please enter a valid phone number.</p>}
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-[13.5px] font-semibold text-[#1e293b]">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
          </div>

          <button type="submit" disabled={loading} className="btn-primary h-11 w-full text-[15px]">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[13.5px] text-[#64748b]">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
