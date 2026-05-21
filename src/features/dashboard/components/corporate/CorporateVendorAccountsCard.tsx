import { Link } from 'react-router-dom'

import { Button, Loader, Tag, Text, Tooltip, TooltipContent, TooltipTrigger } from '@/components'
import { Icon } from '@/libs'
import { cn } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { getStatusVariant } from '@/utils/helpers'

import type { CorporateAccountStatus } from './CorporateAccountStatusBanner'

export type CorporateVendorAccountSummary = {
  id?: number | string
  vendor_id?: number | string
  vendor_name?: string
  business_name?: string
  approval_status?: string
  status?: string
}

function getVendorDisplayName(vendor: CorporateVendorAccountSummary): string {
  return vendor.vendor_name || vendor.business_name || 'Unnamed vendor'
}

function vendorNeedsAttention(vendor: CorporateVendorAccountSummary): boolean {
  const isApproved =
    vendor.approval_status === 'approved' || vendor.approval_status === 'auto_approved'
  const isActive = vendor.status === 'active'
  return !isApproved || !isActive
}

function formatApprovalLabel(approvalStatus?: string): string {
  if (!approvalStatus) return 'Pending approval'
  return approvalStatus.replace(/_/g, ' ')
}

type CorporateVendorAccountsCardProps = {
  vendors: CorporateVendorAccountSummary[]
  isLoading?: boolean
  canCreate: boolean
  accountStatus: CorporateAccountStatus
  onCreateVendor: () => void
  addAccountParam: (path: string) => string
}

export function CorporateVendorAccountsCard({
  vendors,
  isLoading = false,
  canCreate,
  accountStatus,
  onCreateVendor,
  addAccountParam,
}: CorporateVendorAccountsCardProps) {
  const vendorCount = vendors.length
  const pendingCount = vendors.filter(vendorNeedsAttention).length
  const previewVendors = vendors.slice(0, 3)
  const vendorsPath = addAccountParam(ROUTES.IN_APP.DASHBOARD.CORPORATE.ALL_VENDORS)

  const helperText = !canCreate
    ? accountStatus === 'incomplete'
      ? 'Complete onboarding and get approved to unlock vendor account creation.'
      : 'Available after your corporate account is approved.'
    : vendorCount === 0
      ? 'No vendor accounts yet — create one to invite vendors into your workspace.'
      : `${vendorCount} vendor ${vendorCount === 1 ? 'account' : 'accounts'} linked to this workspace${
          pendingCount > 0 ? ` · ${pendingCount} need attention` : ''
        }.`

  const createButton = (
    <Button
      variant="secondary"
      size="medium"
      className={cn(
        'shrink-0 rounded-full px-5',
        !canCreate && 'opacity-50 cursor-not-allowed',
      )}
      onClick={onCreateVendor}
      disabled={!canCreate || isLoading}
    >
      <Icon icon="bi:plus-circle" className="text-lg" />
      {vendorCount === 0 && canCreate ? 'Create a vendor account' : 'Create vendor account'}
    </Button>
  )

  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]',
        !canCreate && 'opacity-90',
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#402D87]/10 text-[#402D87]">
            <Icon icon="bi:shop" className="text-2xl" />
          </div>
          <div className="min-w-0">
            <Text variant="h4" weight="semibold" className="text-gray-900">
              Vendor accounts
            </Text>
            <Text variant="p" className="mt-1 max-w-xl text-sm text-gray-600">
              Create and manage vendor accounts linked to your corporate workspace.
            </Text>
            <Text
              variant="span"
              className={cn(
                'mt-2 block text-xs',
                !canCreate ? 'text-amber-700' : 'text-gray-500',
              )}
            >
              {isLoading ? 'Loading vendor accounts…' : helperText}
            </Text>
          </div>
        </div>

        {!canCreate ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex shrink-0">{createButton}</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{helperText}</TooltipContent>
          </Tooltip>
        ) : (
          createButton
        )}
      </div>

      {canCreate && !isLoading && vendorCount > 0 && (
        <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">
          <ul className="space-y-2">
            {previewVendors.map((vendor, index) => {
              const vendorKey = String(vendor.vendor_id ?? vendor.id ?? index)
              const needsAttention = vendorNeedsAttention(vendor)

              return (
                <li
                  key={vendorKey}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-lg border px-4 py-3',
                    needsAttention
                      ? 'border-amber-200/80 bg-amber-50/50'
                      : 'border-gray-100 bg-gray-50/50',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <Text variant="span" weight="medium" className="block truncate text-gray-900">
                      {getVendorDisplayName(vendor)}
                    </Text>
                    <Text variant="span" className="mt-0.5 block text-xs text-gray-500">
                      {needsAttention ? 'Pending approval or onboarding' : 'Ready to use'}
                    </Text>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                    {vendor.status ? (
                      <Tag value={vendor.status} variant={getStatusVariant(vendor.status)} />
                    ) : null}
                    {vendor.approval_status ? (
                      <Tag
                        value={formatApprovalLabel(vendor.approval_status)}
                        variant={getStatusVariant(vendor.approval_status)}
                      />
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-2">
            {vendorCount > previewVendors.length ? (
              <Text variant="span" className="text-xs text-gray-500">
                Showing {previewVendors.length} of {vendorCount}
              </Text>
            ) : (
              <span />
            )}
            <Link
              to={vendorsPath}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#402D87] hover:text-[#2d1a72]"
            >
              View all vendors
              <Icon icon="bi:arrow-right" className="text-base" />
            </Link>
          </div>
        </div>
      )}

      {canCreate && isLoading && (
        <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-5 text-sm text-gray-500">
          <Loader />
          Loading vendors…
        </div>
      )}
    </section>
  )
}
