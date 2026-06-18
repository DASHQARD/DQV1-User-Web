import { useMemo } from 'react'
import { cn, Icon } from '@/libs'
import { VendorLogoImage } from '../VendorLogo/VendorLogoImage'
import type { VendorLogoFields } from '@/utils/vendorLogo'
import { formatCurrencyLabel } from '@/utils/format'
import { getVendorCatalogStats, type VendorBranchWithCards } from '../../utils/vendorCatalogStats'

type VendorItemProps = VendorLogoFields & {
  name: string
  branches?: number
  businessAddress?: string
  businessCountry?: string
  branchesWithCards?: VendorBranchWithCards[]
  variant?: 'default' | 'compact'
}

function formatPriceRangeLabel(
  minPrice: number | null,
  maxPrice: number | null,
  currency: string,
): string | null {
  if (minPrice == null) return null
  const minLabel = formatCurrencyLabel(minPrice, currency, { minDecimals: 0, maxDecimals: 1 })
  if (maxPrice == null || maxPrice === minPrice) return minLabel
  const maxAmount = formatCurrencyLabel(maxPrice, currency, {
    minDecimals: 0,
    maxDecimals: 1,
  }).replace(`${currency} `, '')
  return `${minLabel} – ${maxAmount}`
}

export const VendorItems = ({
  name,
  branches,
  logo,
  logo_key,
  business_logo,
  vendor_logo,
  branchesWithCards = [],
  variant = 'default',
}: VendorItemProps) => {
  const isCompact = variant === 'compact'
  const vendorLogo: VendorLogoFields = { logo, logo_key, business_logo, vendor_logo }

  const stats = useMemo(() => getVendorCatalogStats(branchesWithCards), [branchesWithCards])
  const branchCount = branches ?? stats.activeBranches
  const priceLabel = formatPriceRangeLabel(stats.minPrice, stats.maxPrice, stats.currency)

  return (
    <article
      className={cn(
        'group flex h-full min-h-[148px] flex-col overflow-hidden rounded-2xl bg-[#1C1C1E] shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-transform duration-200 hover:scale-[1.01]',
        isCompact && 'min-h-[136px] rounded-xl',
      )}
    >
      <div
        className={cn(
          'flex min-h-[76px] items-center gap-3 bg-[#1C1C1E]',
          isCompact ? 'px-3 py-3' : 'px-4 py-3.5',
        )}
      >
        <div
          className={cn(
            'flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#2C2C2E]',
            isCompact ? 'size-11 p-1' : 'size-12 p-1',
          )}
        >
          <VendorLogoImage
            vendor={vendorLogo}
            name={name}
            className="max-h-full max-w-full object-contain"
            iconClassName={cn('text-white/70', isCompact ? 'size-5' : 'size-5')}
            fallbackIcon="bi:shop"
          />
        </div>

        <div className="min-w-0 flex-1 self-center">
          <h4
            className={cn(
              'truncate font-bold leading-tight text-white',
              isCompact ? 'text-[13px]' : 'text-sm',
            )}
          >
            {name}
          </h4>
          {stats.cardTypes.length > 0 ? (
            <div className="mt-1.5 flex flex-nowrap gap-1 overflow-hidden">
              {stats.cardTypes.map((type) => (
                <span
                  key={type}
                  className={cn(
                    'shrink-0 rounded-full bg-white/10 font-medium text-white/90',
                    isCompact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]',
                  )}
                >
                  {type}
                </span>
              ))}
            </div>
          ) : (
            <span className="mt-1.5 block h-5" aria-hidden />
          )}
        </div>

        <Icon
          icon="bi:chevron-right"
          className={cn(
            'shrink-0 self-center text-white/40 transition-colors group-hover:text-white/70',
            isCompact ? 'size-4' : 'size-4',
          )}
          aria-hidden
        />
      </div>

      <div
        className={cn(
          'mt-auto grid flex-1 grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)_minmax(0,1.35fr)] items-center bg-[#2C2C2E]',
          isCompact ? 'gap-x-2 px-3 py-3' : 'gap-x-3 px-4 py-3.5',
        )}
      >
        <div className="min-w-0">
          <p className={cn('font-bold leading-none text-white', isCompact ? 'text-lg' : 'text-xl')}>
            {stats.totalCards}
          </p>
          <p className={cn('text-white/50', isCompact ? 'mt-0.5 text-[9px]' : 'mt-1 text-[10px]')}>
            cards
          </p>
        </div>

        <div className="h-9 w-px bg-white/10" aria-hidden />

        <div className="min-w-0">
          <p className={cn('font-bold leading-none text-white', isCompact ? 'text-lg' : 'text-xl')}>
            {branchCount}
          </p>
          <p className={cn('text-white/50', isCompact ? 'mt-0.5 text-[9px]' : 'mt-1 text-[10px]')}>
            branches
          </p>
        </div>

        <div className="min-w-0 text-right">
          <p className={cn('text-white/50', isCompact ? 'text-[9px]' : 'text-[10px]')}>
            Price range
          </p>
          {priceLabel ? (
            <p
              className={cn(
                'mt-0.5 font-semibold leading-tight text-white',
                isCompact ? 'text-[10px]' : 'text-[11px]',
              )}
              title={priceLabel}
            >
              {priceLabel}
            </p>
          ) : (
            <p className="mt-0.5 text-[11px] text-white/40">—</p>
          )}
        </div>
      </div>
    </article>
  )
}
