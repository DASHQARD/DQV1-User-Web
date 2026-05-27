import { useMemo } from 'react'
import { cn, Icon } from '@/libs'
import { VendorLogoImage } from '../VendorLogo/VendorLogoImage'
import type { VendorLogoFields } from '@/utils/vendorLogo'
import { formatCurrencyLabel } from '@/utils/format'
import {
  getVendorCatalogStats,
  type VendorBranchWithCards,
} from '../../utils/vendorCatalogStats'

type VendorItemProps = VendorLogoFields & {
  name: string
  branches?: number
  businessAddress?: string
  businessCountry?: string
  branchesWithCards?: VendorBranchWithCards[]
  variant?: 'default' | 'compact'
}

function formatPriceLabel(
  minPrice: number | null,
  maxPrice: number | null,
  currency: string,
  compact: boolean,
): string | null {
  if (minPrice == null) return null
  if (compact || maxPrice == null || maxPrice === minPrice) {
    return `From ${formatCurrencyLabel(minPrice, currency)}`
  }
  return `${formatCurrencyLabel(minPrice, currency)} – ${formatCurrencyLabel(maxPrice, currency)}`
}

export const VendorItems = ({
  name,
  branches,
  logo,
  logo_key,
  business_logo,
  vendor_logo,
  businessCountry,
  branchesWithCards = [],
  variant = 'default',
}: VendorItemProps) => {
  const isCompact = variant === 'compact'
  const vendorLogo: VendorLogoFields = { logo, logo_key, business_logo, vendor_logo }

  const stats = useMemo(() => getVendorCatalogStats(branchesWithCards), [branchesWithCards])
  const branchCount = branches ?? stats.activeBranches
  const priceLabel = formatPriceLabel(stats.minPrice, stats.maxPrice, stats.currency, isCompact)
  const cardTypesLabel = stats.cardTypes.join(' · ')
  const statsLabel = `${stats.totalCards} ${stats.totalCards === 1 ? 'card' : 'cards'} · ${branchCount} ${branchCount === 1 ? 'branch' : 'branches'}`

  return (
    <article
      className={cn(
        'group flex h-full flex-col rounded-xl border border-gray-100 bg-white transition-shadow',
        isCompact
          ? 'shadow-none md:shadow-[0_2px_8px_rgba(0,0,0,0.06)] md:hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]'
          : 'shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]',
      )}
    >
      <div className={cn('flex flex-1 flex-col', isCompact ? 'gap-3 p-3' : 'gap-3.5 p-4')}>
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              'flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50',
              isCompact ? 'h-11 w-11 p-1' : 'h-12 w-12 p-1.5',
            )}
          >
            <VendorLogoImage
              vendor={vendorLogo}
              name={name}
              className="max-h-full max-w-full object-contain"
              iconClassName={cn('text-[#402D87]', isCompact ? 'size-5' : 'size-6')}
              fallbackIcon="bi:shop"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4
              className={cn(
                'truncate font-semibold text-gray-900 transition-colors group-hover:text-[#402D87]',
                isCompact ? 'text-sm' : 'text-base',
              )}
            >
              {name}
            </h4>
            {businessCountry ? (
              <p
                className={cn(
                  'mt-0.5 flex items-center gap-1 truncate text-gray-500',
                  isCompact ? 'text-[11px]' : 'text-xs',
                )}
              >
                <Icon icon="bi:geo-alt" className="size-3 shrink-0 text-gray-400" />
                {businessCountry}
              </p>
            ) : null}
          </div>
        </div>

        {cardTypesLabel ? (
          <p className={cn('truncate text-gray-500', isCompact ? 'text-[11px]' : 'text-xs')}>
            {cardTypesLabel}
          </p>
        ) : null}

        <div className="mt-auto space-y-1 border-t border-gray-100 pt-3">
          <p
            className={cn(
              'whitespace-nowrap text-gray-600',
              isCompact ? 'text-[11px]' : 'text-xs',
            )}
          >
            {statsLabel}
          </p>
          {priceLabel ? (
            <p
              className={cn(
                'truncate font-bold text-[#402D87]',
                isCompact ? 'text-sm' : 'text-base',
              )}
            >
              {priceLabel}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  )
}
