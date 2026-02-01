import { PASSWORD_SPECIAL_CHARACTERS } from '@/utils/constants'

type Props = {
  password: string
}

export default function PasswordRequirementsChecklist({ password }: Props) {
  const hasMinLength = password.length >= 8
  const hasNumber = /\d/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasSpecialChar = /[!@#$%^&*()]/.test(password)

  const items = [
    { met: hasMinLength, label: 'Minimum 8 characters' },
    { met: hasNumber, label: 'One number' },
    { met: hasUppercase, label: 'One Uppercase character' },
    {
      met: hasSpecialChar,
      label: `One special character (${PASSWORD_SPECIAL_CHARACTERS})`,
    },
  ]

  return (
    <section className="flex flex-col gap-2">
      {items.map(({ met, label }) => (
        <div key={label} className="flex items-center gap-2 text-gray-500">
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
              met ? 'bg-primary-400 text-white' : 'bg-gray-300 text-gray-600'
            }`}
          >
            {met ? '✓' : '✗'}
          </div>
          <p className="text-xs leading-[18px]">{label}</p>
        </div>
      ))}
    </section>
  )
}
