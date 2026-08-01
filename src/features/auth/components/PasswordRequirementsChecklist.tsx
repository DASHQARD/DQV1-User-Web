import { PASSWORD_SPECIAL_CHARACTERS } from '@/utils/constants'

type Props = {
  password: string
  /** Denser layout for mobile signup */
  compact?: boolean
}

export default function PasswordRequirementsChecklist({ password, compact = false }: Props) {
  const hasMinLength = password.length >= 8
  const hasNumber = /\d/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasSpecialChar = /[!@#$%^&*()]/.test(password)

  const items = [
    { met: hasMinLength, label: 'Minimum 8 characters' },
    { met: hasUppercase, label: 'One uppercase letter' },
    { met: hasLowercase, label: 'One lowercase letter' },
    { met: hasNumber, label: 'One number' },
    {
      met: hasSpecialChar,
      label: `One special character (${PASSWORD_SPECIAL_CHARACTERS})`,
    },
  ]

  const visibleItems = compact ? items.filter(({ met }) => !met) : items

  if (compact && visibleItems.length === 0) {
    return null
  }

  return (
    <section className={compact ? 'grid grid-cols-2 gap-x-2 gap-y-1' : 'flex flex-col gap-2'}>
      {visibleItems.map(({ met, label }) => (
        <div key={label} className="flex items-center gap-1.5 text-gray-500">
          <div
            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
              met ? 'bg-primary-400 text-white' : 'bg-gray-300 text-gray-600'
            }`}
          >
            {met ? '✓' : '✗'}
          </div>
          <p className={compact ? 'text-[10px] leading-tight' : 'text-xs leading-[18px]'}>
            {compact && label.startsWith('One special character')
              ? 'Special char (!@#$…)'
              : label}
          </p>
        </div>
      ))}
    </section>
  )
}
