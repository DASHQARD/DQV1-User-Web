import { EXAMPLE_PHONE_LOCAL, PHONE_FORMAT_HINT_PREFIX } from '@/utils/constants/phone'

type PhoneFormatHintProps = {
  className?: string
  /** `hint` adds default small gray paragraph styling */
  variant?: 'inline' | 'hint'
}

export function PhoneFormatHint({ className, variant = 'inline' }: PhoneFormatHintProps) {
  const content = (
    <>
      {PHONE_FORMAT_HINT_PREFIX}{' '}
      <span className="font-medium">{EXAMPLE_PHONE_LOCAL}</span>
    </>
  )

  if (variant === 'hint') {
    return <p className={className ?? 'text-xs text-gray-500'}>{content}</p>
  }

  return <span className={className}>{content}</span>
}
