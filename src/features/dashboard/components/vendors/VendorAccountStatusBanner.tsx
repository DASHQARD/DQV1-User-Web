import { Icon } from '@/libs'
import { Text } from '@/components'
import { cn } from '@/libs'

type VendorAccountStatusBannerProps = {
  status?: string | null
  /** When true, signup/compliance is done but payment/branch dashboard steps remain. */
  hasRemainingSetupSteps?: boolean
  className?: string
}

export function VendorAccountStatusBanner({
  status,
  hasRemainingSetupSteps = false,
  className,
}: VendorAccountStatusBannerProps) {
  const statusLabel = status ? String(status).replace(/_/g, ' ') : 'inactive'

  return (
    <div
      className={cn(
        'rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3 text-amber-900',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Icon icon="bi:clock-history" className="text-xl shrink-0 mt-0.5" />
      <div className="min-w-0">
        <Text variant="span" weight="semibold" className="block mb-1">
          Account pending DashQard admin approval
        </Text>
        <Text variant="span" className="text-sm block opacity-90">
          {hasRemainingSetupSteps ? (
            <>
              Your signup and compliance details have been submitted. A DashQard administrator must
              review and approve your account before experiences, redemptions, payouts, and other
              operational features are fully available. Your account status is currently{' '}
              <span className="font-semibold capitalize">{statusLabel}</span>.
            </>
          ) : (
            <>
              You have completed vendor setup. A DashQard administrator must review and approve your
              account before you can use experiences, redemptions, payouts, and other operational
              features. Your account status is currently{' '}
              <span className="font-semibold capitalize">{statusLabel}</span>.
            </>
          )}
        </Text>
        <Text variant="span" className="text-sm block mt-2 opacity-90">
          {hasRemainingSetupSteps
            ? 'Finish payment and branch setup below while you wait. We will notify you when your account is activated.'
            : 'You can still update compliance and payment setup while you wait. We will notify you when your account is activated.'}
        </Text>
      </div>
    </div>
  )
}
