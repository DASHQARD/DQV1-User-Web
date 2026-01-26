import React from 'react'
import { Button, Text } from '@/components'
import { Icon } from '@/libs'
import { useUserProfile, usePresignedURL } from '@/hooks'
import { cn } from '@/libs'
import { RequestBusinessUpdateModal } from '@/features/dashboard/components/corporate/modals'

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  llc: 'Limited Liability Company',
  sole_proprietor: 'Sole Proprietorship',
  partnership: 'Partnership',
  corporation: 'Corporation',
}

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

export function BusinessDetailsSettings() {
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null)
  const [isRequestModalOpen, setIsRequestModalOpen] = React.useState(false)

  const business = userProfileData?.business_details?.[0]

  React.useEffect(() => {
    const logoDocument = userProfileData?.business_documents?.find((doc) => doc.type === 'logo')
    if (!logoDocument?.file_url) {
      setLogoUrl(null)
      return
    }

    let cancelled = false
    const loadLogo = async () => {
      try {
        const url = await fetchPresignedURL(logoDocument.file_url)
        if (!cancelled) setLogoUrl(url)
      } catch {
        if (!cancelled) setLogoUrl(null)
      }
    }
    loadLogo()
    return () => {
      cancelled = true
    }
  }, [userProfileData?.business_documents, fetchPresignedURL])

  const businessTypeLabel =
    business?.type && BUSINESS_TYPE_LABELS[business.type]
      ? BUSINESS_TYPE_LABELS[business.type]
      : business?.type || '—'

  if (!business) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <Text variant="p" className="text-gray-500">
          No business details available.
        </Text>
      </div>
    )
  }

  return (
    <div className="space-y-0 mt-6">
      {/* Info callout */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3">
        <Icon icon="bi:info-circle" className="text-amber-600 text-xl shrink-0 mt-0.5" />
        <div>
          <Text variant="span" weight="semibold" className="text-amber-900 block mb-1">
            Request to update business information
          </Text>
          <Text variant="p" className="text-amber-800/90 text-sm">
            Corporates can&apos;t change or update business information on their own. You can
            request an update here; an admin will manually review and process it.
          </Text>
        </div>
      </div>

      {/* Business info card */}
      <div className="rounded-2xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100">
          <Text variant="h4" weight="semibold" className="text-gray-900">
            Business details
          </Text>
          <Text variant="span" className="text-gray-500 text-sm mt-0.5 block">
            View-only. Use &quot;Request update&quot; to request changes.
          </Text>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Business logo
              </span>
              <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={business.name || 'Business logo'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icon icon="bi:building" className="text-gray-400 text-2xl" />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DetailRow label="Business name" value={business.name} />
            <DetailRow label="Business type" value={businessTypeLabel} />
            <DetailRow label="Phone" value={business.phone} />
            <DetailRow label="Email" value={business.email} />
            <DetailRow
              label="Street address"
              value={business.street_address}
              className="sm:col-span-2"
            />
            <DetailRow label="Digital address" value={business.digital_address || '—'} />
            <DetailRow label="Registration number" value={business.registration_number} />
          </div>
        </div>

        <div className="px-5 sm:px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <Text variant="span" className="text-gray-600 text-sm">
            Need to change something? Request an update.
          </Text>
          <Button type="button" variant="secondary" onClick={() => setIsRequestModalOpen(true)}>
            Request update
          </Button>
        </div>
      </div>

      <RequestBusinessUpdateModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
    </div>
  )
}
