import { Icon } from '@/libs'
import { cn } from '@/libs'

interface ProfileSwitcherProps {
  value?: 'vendor' | 'corporate'
  onChange?: (value: 'vendor' | 'corporate') => void
  className?: string
}

export default function ProfileSwitcher({
  value = 'vendor',
  onChange,
  className,
}: ProfileSwitcherProps) {
  const handleClick = (type: 'vendor' | 'corporate') => {
    onChange?.(type)
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="inline-block bg-gray-50 rounded-xl p-1 border border-gray-200 w-full">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => handleClick('vendor')}
            className={cn(
              'flex items-center justify-center gap-2 px-3 py-2 border-none rounded-lg bg-transparent cursor-pointer transition-all duration-300 flex-1',
              value === 'vendor'
                ? 'bg-gradient-to-br from-[#402D87] to-[#5B4397] text-white shadow-[0_2px_8px_rgba(64,45,135,0.3)]'
                : 'hover:bg-[rgba(64,45,135,0.05)] text-gray-700',
            )}
          >
            <Icon
              icon="bi:shop-window"
              className={cn(
                'text-sm transition-colors duration-300',
                value === 'vendor' ? 'text-white' : 'text-gray-500',
              )}
            />
            <span
              className={cn(
                'text-xs font-medium leading-tight transition-all duration-300',
                value === 'vendor' ? 'text-white' : 'text-gray-700',
              )}
            >
              Vendor
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleClick('corporate')}
            className={cn(
              'flex items-center justify-center gap-2 px-3 py-2 border-none rounded-lg bg-transparent cursor-pointer transition-all duration-300 flex-1',
              value === 'corporate'
                ? 'bg-gradient-to-br from-[#402D87] to-[#5B4397] text-white shadow-[0_2px_8px_rgba(64,45,135,0.3)]'
                : 'hover:bg-[rgba(64,45,135,0.05)] text-gray-700',
            )}
          >
            <Icon
              icon="bi:building-fill"
              className={cn(
                'text-sm transition-colors duration-300',
                value === 'corporate' ? 'text-white' : 'text-gray-500',
              )}
            />
            <span
              className={cn(
                'text-xs font-medium leading-tight transition-all duration-300',
                value === 'corporate' ? 'text-white' : 'text-gray-700',
              )}
            >
              Corporate
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
