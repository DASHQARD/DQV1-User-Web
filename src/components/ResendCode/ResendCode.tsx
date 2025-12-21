import { cn } from '@/libs'
import { CustomIcon } from '../CustomIcon'
import { Text } from '../Text'

interface ResendCodeProps {
  countdown: number | null
  formatCountdown: (countdown: number) => string
  onResend: () => void
  isLoading?: boolean
  className?: string
}

export default function ResendCode({
  countdown,
  formatCountdown,
  onResend,
  isLoading = false,
  className,
}: Readonly<ResendCodeProps>) {
  return (
    <Text variant="span" className={cn('text-gray-600 leading-5', className)}>
      Didn't get a code?{' '}
      {!countdown ? (
        <button type="button" onClick={onResend} disabled={isLoading} className="text-primary-400">
          Resend code
        </button>
      ) : (
        <span className="text-primary-400">Resend in {formatCountdown(countdown)}</span>
      )}
      {isLoading && <CustomIcon name="Circle" className="animate-spin inline-block" />}
    </Text>
  )
}
