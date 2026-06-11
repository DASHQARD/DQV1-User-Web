import { Avatar, Tag, Text } from '@/components'
import { useCorporateSwitchWorkspace } from '@/features/dashboard/corporate/hooks/useCorporateSwitchWorkspace'
import { Icon } from '@/libs'
import { cn } from '@/libs'

type MobileSwitchWorkspaceProps = {
  onAfterSwitch?: () => void
}

export function MobileSwitchWorkspace({ onAfterSwitch }: MobileSwitchWorkspaceProps) {
  const {
    isCorporateSuperAdmin,
    allVendorsCreatedByCorporate,
    hasVendorsPendingVerification,
    vendorLogoUrls,
    corporateLogoUrl,
    corporateName,
    currentVendorId,
    isVendorView,
    handleSwitchToVendor,
    handleSwitchToCorporate,
    resolveVendorId,
  } = useCorporateSwitchWorkspace()

  if (!isCorporateSuperAdmin) return null

  const switchAndClose = (action: () => void) => {
    action()
    onAfterSwitch?.()
  }

  return (
    <div className="border-b border-gray-200 pb-3 mb-3">
      <Text
        variant="span"
        className="text-xs text-gray-500 uppercase tracking-wider block mb-2 px-4"
      >
        Switch Workspace
      </Text>

      {allVendorsCreatedByCorporate.length > 0 && (
        <div className="mb-2 max-h-48 overflow-y-auto space-y-0.5 px-2">
          {allVendorsCreatedByCorporate.map((vendor: Record<string, unknown>) => {
            const vendorId = resolveVendorId(vendor as Parameters<typeof resolveVendorId>[0])
            if (vendorId == null) return null

            const vendorName = String(vendor.vendor_name || vendor.business_name || 'Vendor')
            const isApproved =
              vendor.approval_status === 'approved' ||
              vendor.approval_status === 'auto_approved'
            const isActive = vendor.status === 'active'
            const canSwitch = isApproved && isActive
            const isCurrentVendor =
              isVendorView &&
              currentVendorId != null &&
              (String(vendorId) === currentVendorId || String(vendor.id) === currentVendorId)
            const needsOnboarding = isApproved && !isActive
            const statusLabel = needsOnboarding
              ? 'Complete onboarding'
              : !canSwitch
                ? 'Pending verification'
                : null

            return (
              <button
                key={String(vendorId)}
                type="button"
                disabled={!canSwitch || isCurrentVendor}
                onClick={() => switchAndClose(() => handleSwitchToVendor(vendorId))}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors',
                  isCurrentVendor && 'bg-[rgba(64,45,135,0.08)]',
                  canSwitch && !isCurrentVendor && 'hover:bg-gray-50',
                  !canSwitch && 'cursor-not-allowed opacity-70 bg-gray-50/80',
                )}
              >
                <Avatar
                  size="sm"
                  src={vendorLogoUrls[String(vendorId)]}
                  name={vendorName}
                  className={!canSwitch ? 'opacity-75' : undefined}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Text variant="span" weight="semibold" className="block truncate text-sm">
                      {vendorName}
                    </Text>
                    {statusLabel && (
                      <Tag value={statusLabel} variant="warning" className="shrink-0 text-[10px]" />
                    )}
                  </div>
                  <Text variant="span" className="block truncate text-xs text-gray-500">
                    {String(vendor.gvid || `ID: ${vendorId}`)}
                  </Text>
                </div>
                {canSwitch ? (
                  isCurrentVendor ? (
                    <Icon icon="bi:check-circle-fill" className="shrink-0 text-lg text-[#402D87]" />
                  ) : (
                    <Icon icon="bi:chevron-right" className="shrink-0 text-sm text-gray-400" />
                  )
                ) : (
                  <Icon icon="bi:lock-fill" className="shrink-0 text-sm text-gray-400" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {hasVendorsPendingVerification && (
        <div className="mx-2 mb-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <Icon icon="bi:clock-history" className="shrink-0 text-sm text-amber-600" />
          <Text variant="span" className="text-xs text-amber-800">
            Some vendor accounts need attention (pending approval or onboarding)
          </Text>
        </div>
      )}

      {isVendorView && (
        <button
          type="button"
          onClick={() => switchAndClose(handleSwitchToCorporate)}
          className="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
        >
          <Avatar size="sm" src={corporateLogoUrl} name={corporateName} />
          <div className="min-w-0 flex-1">
            <Text variant="span" weight="semibold" className="block truncate text-sm">
              Corporate View
            </Text>
            <Text variant="span" className="mt-0.5 block truncate text-xs text-gray-500">
              Switch to corporate sidebar
            </Text>
          </div>
          <Icon icon="bi:chevron-right" className="shrink-0 text-sm text-gray-400" />
        </button>
      )}
    </div>
  )
}
