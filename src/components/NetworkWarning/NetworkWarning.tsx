import { Icon } from '@/libs'
import { NETWORK_ISSUE_MESSAGE } from '@/utils/networkError'

type NetworkWarningProps = {
  message?: string
  className?: string
}

export function NetworkWarning({
  message = NETWORK_ISSUE_MESSAGE,
  className = '',
}: NetworkWarningProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 ${className}`}
    >
      <Icon icon="bi:wifi-off" className="text-lg shrink-0 mt-0.5" />
      <p className="text-sm leading-relaxed">{message}</p>
    </div>
  )
}
