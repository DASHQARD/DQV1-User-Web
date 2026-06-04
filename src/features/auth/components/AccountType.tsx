import { Icon } from '@/libs'
import { cn } from '@/libs'

interface AccountTypeProps {
  value?: 'user' | 'corporate'
  onChange?: (value: 'user' | 'corporate') => void
  /** Segmented control styling for mobile signup */
  compact?: boolean
}

function optionClasses(isActive: boolean, compact: boolean) {
  if (compact) {
    return cn(
      'flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border-none px-3 py-2.5 text-sm font-medium transition-colors duration-200',
      isActive
        ? 'bg-primary-500 text-white'
        : 'bg-transparent text-gray-600 hover:text-gray-900',
    )
  }

  return cn(
    'flex min-w-0 flex-1 items-center gap-1.5 border-none rounded-xl bg-transparent cursor-pointer transition-all duration-300 sm:gap-2 sm:px-3 px-3 py-2.5 sm:px-4 md:py-3',
    isActive
      ? 'bg-linear-to-br from-[#402D87] to-[#5B4397] text-white shadow-[0_4px_12px_rgba(64,45,135,0.3)]'
      : 'hover:bg-[rgba(64,45,135,0.05)]',
  )
}

export default function AccountType({ value = 'user', onChange, compact = false }: AccountTypeProps) {
  const handleClick = (type: 'user' | 'corporate') => {
    onChange?.(type)
  }

  if (compact) {
    return (
      <div className="w-full" role="group" aria-label="Account type">
        <div className="flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => handleClick('user')}
            className={optionClasses(value === 'user', true)}
            aria-pressed={value === 'user'}
          >
            <Icon icon="bi:person-fill" className="size-4 shrink-0" />
            <span>Personal</span>
          </button>
          <button
            type="button"
            onClick={() => handleClick('corporate')}
            className={optionClasses(value === 'corporate', true)}
            aria-pressed={value === 'corporate'}
          >
            <Icon icon="bi:building-fill" className="size-4 shrink-0" />
            <span>Corporate</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4 w-full text-center">
      <div className="mx-auto w-full max-w-full rounded-2xl border border-gray-200 bg-gray-50 p-1.5">
        <div className="flex w-full gap-1">
          <button
            type="button"
            onClick={() => handleClick('user')}
            className={optionClasses(value === 'user', false)}
          >
            <div className="flex h-6 w-6 items-center justify-center">
              <Icon
                icon="bi:person-fill"
                className={cn(
                  'text-sm md:text-base transition-colors duration-300',
                  value === 'user' ? 'text-white' : 'text-gray-500',
                )}
              />
            </div>
            <div className="flex flex-col items-start text-left">
              <span
                className={cn(
                  'text-[13px] leading-tight transition-all duration-300 md:text-sm',
                  value === 'user' ? 'font-semibold text-white' : 'font-medium text-[#1a1a1a]',
                )}
              >
                User
              </span>
              <span
                className={cn(
                  'text-[11px] leading-tight transition-all duration-300 md:text-xs',
                  value === 'user' ? 'text-white/80' : 'text-gray-500',
                )}
              >
                Personal account
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleClick('corporate')}
            className={optionClasses(value === 'corporate', false)}
          >
            <div className="flex h-6 w-6 items-center justify-center">
              <Icon
                icon="bi:shop-window"
                className={cn(
                  'text-sm md:text-base transition-colors duration-300',
                  value === 'corporate' ? 'text-white' : 'text-gray-500',
                )}
              />
            </div>
            <div className="flex flex-col items-start text-left">
              <span
                className={cn(
                  'text-[13px] leading-tight transition-all duration-300 md:text-sm',
                  value === 'corporate' ? 'font-semibold text-white' : 'font-medium text-[#1a1a1a]',
                )}
              >
                Corporate
              </span>
              <span
                className={cn(
                  'text-[11px] leading-tight transition-all duration-300 md:text-xs',
                  value === 'corporate' ? 'text-white/80' : 'text-gray-500',
                )}
              >
                Corporate account
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
