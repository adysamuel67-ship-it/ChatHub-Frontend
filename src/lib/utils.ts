export function formatTime(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatDay(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const thatDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

  if (thatDay === startOfDay) return formatTime(iso)
  if (thatDay === startOfDay - 86400000) return 'Yesterday'
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString([], { weekday: 'short' })
  }
  return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })
}

export function hashSeed(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return hash
}

const AVATAR_GRADIENTS: [string, string][] = [
  ['#3B82F6', '#1D4ED8'],
  ['#0EA5E9', '#0369A1'],
  ['#6366F1', '#4338CA'],
  ['#06B6D4', '#0E7490'],
  ['#38BDF8', '#0284C7'],
  ['#818CF8', '#4F46E5'],
  ['#22D3EE', '#0F766E'],
  ['#60A5FA', '#2563EB'],
]

export function avatarGradient(seed: string): { background: string } {
  const [from, to] = AVATAR_GRADIENTS[hashSeed(seed) % AVATAR_GRADIENTS.length]
  return { background: `linear-gradient(135deg, ${from}, ${to})` }
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 10) {
    const last10 = digits.slice(-10)
    return `+${last10.slice(0, -10) || ''}(${last10.slice(0, 3)}) ${last10.slice(3, 6)}-${last10.slice(6)}`
  }
  return phone
}

export function classNames(...args: (string | false | null | undefined)[]): string {
  return args.filter(Boolean).join(' ')
}