import { Icon } from '@/libs'
import { Text } from '@/components'
import { cn } from '@/libs'

export type CorporateAccountStatus = 'incomplete' | 'pending_approval' | 'full_access'

type Props = {
  status: CorporateAccountStatus
  className?: string
}

const COPY: Record<
  CorporateAccountStatus,
  { title: string; description: string; icon: string; variant: 'info' | 'warning' | 'success' }
> = {
  incomplete: {
    title: 'Complete your profile to unlock all features',
    description:
      'Finish onboarding (profile, ID, and business details) to activate your corporate account. Some features—like creating vendor accounts, purchases, and vendor management—will remain locked until you complete these steps and receive approval.',
    icon: 'bi:info-circle-fill',
    variant: 'info',
  },
  pending_approval: {
    title: 'Your account is under review',
    description:
      'Your profile is complete. We will review your information within 24 to 48 hours. Some features (e.g. Create vendor account, Purchases, Vendor Invitations, All Vendors) will become available after your account is approved. You can still view your dashboard.',
    icon: 'bi:clock-history',
    variant: 'warning',
  },
  full_access: {
    title: 'You have full access to corporate features',
    description:
      'Your account is approved. You can create vendor accounts, manage purchases, recipients, and more.',
    icon: 'bi:check-circle-fill',
    variant: 'success',
  },
}

const variantStyles = {
  info: 'bg-[#EFF6FF] border-[#3B82F6]/30 text-[#1E40AF]',
  warning: 'bg-amber-50 border-amber-200 text-amber-900',
  success: 'bg-[#ECFDF5] border-[#10B981]/30 text-[#065F46]',
}

export function CorporateAccountStatusBanner({ status, className }: Props) {
  if (status === 'full_access') return null

  const { title, description, icon, variant } = COPY[status]
  const styles = variantStyles[variant]

  return (
    <div
      className={cn('rounded-xl border p-4 flex gap-3', styles, className)}
      role="status"
      aria-live="polite"
    >
      <Icon icon={icon} className="text-xl shrink-0 mt-0.5" />
      <div className="min-w-0">
        <Text variant="span" weight="semibold" className="block mb-1">
          {title}
        </Text>
        <Text variant="span" className="text-sm opacity-90 block">
          {description}
        </Text>
      </div>
    </div>
  )
}
