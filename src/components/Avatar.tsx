import { avatarGradient, initials } from '../lib/utils'

interface AvatarProps {
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  online?: boolean
  className?: string
  ring?: boolean
}

const sizeMap = {
  xs: 'h-8 w-8 text-[11px]',
  sm: 'h-10 w-10 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-20 w-20 text-2xl',
}

const dotSize = {
  xs: 'h-2.5 w-2.5 bottom-0 right-0',
  sm: 'h-3 w-3 bottom-0 right-0',
  md: 'h-3.5 w-3.5 bottom-0.5 right-0.5',
  lg: 'h-5 w-5 bottom-1 right-1',
}

export default function Avatar({ name = '?', size = 'md', online, className = '', ring }: AvatarProps) {
  const gradient = avatarGradient(name || '?')
  return (
    <div className={`relative shrink-0 ${className}`}>
      <div
        className={`${sizeMap[size]} ${ring ? 'ring-2 ring-white/90 shadow-lg' : ''} flex items-center justify-center rounded-full font-semibold text-white select-none`}
        style={gradient}
      >
        {initials(name || '?')}
      </div>
      {online && (
        <span className={`absolute ${dotSize[size]} rounded-full bg-emerald-400 ring-2 ring-white`} />
      )}
    </div>
  )
}