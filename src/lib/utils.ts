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
  ['#FF6B9D', '#C93A76'],
  ['#4A90D9', '#2756A6'],
  ['#2BC886', '#0E9266'],
  ['#F7B733', '#F0932B'],
  ['#8D6CE0', '#5E3BB5'],
  ['#FF8A5C', '#E24E42'],
  ['#35C3D9', '#0F8BA8'],
  ['#FFD36E', '#E8A838'],
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