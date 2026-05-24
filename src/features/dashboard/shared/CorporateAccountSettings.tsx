import type React from 'react'
import { Button, Text } from '@/components'
import { Icon } from '@/libs'
import { cn } from '@/libs'
import { RequestCorporateAccountUpdateModal } from '@/features/dashboard/components/corporate/modals/RequestCorporateAccountUpdateModal'
import { useCorporateAccountSettings } from '@/features/dashboard/hooks/useCorporateAccountSettings'

function DetailRow({
  label,
  value,
  className,
}: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value || '—'}</span>
    </div>
  )
}

export function CorporateAccountSettings() {
  const { profile, openRequestModal } = useCorporateAccountSettings()

  if (!profile) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <Text variant="p" className="text-gray-500">
          No account details available.
        </Text>
      </div>
    )
  }

  return (
    <div className="space-y-0 mt-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3">
        <Icon icon="bi:info-circle" className="text-amber-600 text-xl shrink-0 mt-0.5" />
        <div>
          <Text variant="span" weight="semibold" className="text-amber-900 block mb-1">
            Request to update account information
          </Text>
          <Text variant="p" className="text-amber-800/90 text-sm">
            Corporate account fields cannot be edited directly. Submit a request here and a platform
            admin will review it before any changes are applied.
          </Text>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-gray-100 mt-6">
        <div className="p-5 sm:p-6 border-b border-gray-100">
          <Text variant="h4" weight="semibold" className="text-gray-900">
            Account details
          </Text>
          <Text variant="span" className="text-gray-500 text-sm mt-0.5 block">
            View-only. Use &quot;Request update&quot; to propose changes.
          </Text>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DetailRow label="Full name" value={profile.fullname} />
            <DetailRow label="Email" value={profile.email} />
            <DetailRow label="Phone number" value={profile.phonenumber} />
            <DetailRow label="Country code" value={profile.country_code} />
            <DetailRow
              label="Street address"
              value={profile.street_address}
              className="sm:col-span-2"
            />
          </div>
        </div>

        <div className="px-5 sm:px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <Text variant="span" className="text-gray-600 text-sm">
            Need to change something? Request an update.
          </Text>
          <Button type="button" variant="secondary" onClick={openRequestModal}>
            Request update
          </Button>
        </div>
      </div>

      <RequestCorporateAccountUpdateModal />
    </div>
  )
}
