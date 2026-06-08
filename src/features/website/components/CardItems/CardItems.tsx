import { cn, Icon } from '@/libs'
import { Text } from '@/components'
import { useCardItem } from '../../hooks/useCardItem'
import type { FeaturedCardProps } from '@/types'
import { formatDate } from '@/utils/format'
import { formatCardDisplayTitle } from '@/utils/cardDisplay'
import { getCardStatusBarWidth, resolveCardDisplayStatus } from '@/utils/cardExpiry'
import { VendorLogoImage } from '../VendorLogo/VendorLogoImage'
import { CardItemImage } from './CardItemImage'
import type { VendorLogoFields } from '@/utils/vendorLogo'

type CardItemsProps = FeaturedCardProps & {
  /** Tighter layout for two-column mobile grids (e.g. landing Featured Cards). */
  density?: 'default' | 'compact'
}

export const CardItems = (props: CardItemsProps) => {
  const { density = 'default', ...card } = props
  const isCompact = density === 'compact'
  const { displayPrice, displayProduct, handleCardClick, product, vendor_name, branch_name, isPurchasable } =
    useCardItem({
      ...card,
      card_name: (card as { card_name?: string }).card_name,
    })
  const displayStatus = resolveCardDisplayStatus(card.status, card.expiry_date)
  const isExpired = displayStatus === 'expired'
  const statusBarWidth = getCardStatusBarWidth(displayStatus)
  const firstImageUrl = (card as any)?.images?.[0]?.file_url as string | undefined
  const vendorLogo: VendorLogoFields = {
    logo: card.logo,
    logo_key: card.logo_key,
  }

  return (
    <article
      className={cn(
        'flex h-fit w-full self-start flex-col bg-white overflow-hidden group transition-shadow',
        isExpired ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        isCompact
          ? 'rounded-lg border border-gray-200/80 shadow-none md:rounded-xl md:border-gray-100 md:shadow-[0_2px_8px_rgba(0,0,0,0.06)] md:hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]'
          : 'rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]',
      )}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyPress={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleCardClick()
        }
      }}
    >
      <div className="relative aspect-video shrink-0 bg-gray-100 overflow-hidden">
        {isExpired ? (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-gray-900/80 px-2 py-0.5 text-[10px] font-semibold text-white">
            Expired
          </span>
        ) : null}
        <CardItemImage
          fileUrl={firstImageUrl}
          cardType={card.type}
          alt={`${product} card background`}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
      </div>

      <div
        className={cn(
          'flex flex-col',
          isCompact ? 'px-2 pt-2 pb-3 md:px-3 md:pt-3 md:pb-4' : 'p-3 pb-4',
        )}
      >
        <span
          className={cn(
            'inline-flex w-fit self-start items-center gap-1 rounded-full font-bold bg-[#402D87]/10 text-[#402D87] mb-1.5',
            isCompact
              ? 'px-1.5 py-0.5 text-[9px] md:text-[10px] md:mb-2'
              : 'px-2 py-0.5 text-[10px] mb-2',
          )}
        >
          <Icon
            icon="bi:briefcase-fill"
            className={isCompact ? 'text-[7px] md:text-[8px]' : 'text-[8px]'}
          />
          {card.type?.toUpperCase() || 'DASHX'}
        </span>
        {displayProduct ? (
          <Text
            variant="span"
            weight="semibold"
            className={cn(
              'text-gray-900 block line-clamp-2 leading-snug',
              isCompact ? 'text-[11px] mb-1 md:text-xs md:mb-2' : 'text-xs mb-2',
            )}
          >
            {displayProduct}
          </Text>
        ) : null}
        {card.expiry_date ? (
          <Text
            variant="span"
            className={cn(
              'text-gray-500 flex items-center gap-0.5',
              isCompact ? 'text-[9px] mb-1.5 md:text-[10px] md:mb-2' : 'text-[10px] mb-2',
            )}
          >
            <Icon
              icon="bi:calendar-event"
              className={isCompact ? 'size-2 md:size-2.5' : 'size-2.5'}
            />
            Expires {formatDate(card.expiry_date)}
          </Text>
        ) : null}
        <div className={cn(isCompact ? 'mb-1.5 md:mb-2' : 'mb-2')}>
          <div
            className={cn(
              'rounded-full bg-gray-100 overflow-hidden',
              isCompact ? 'h-0.5 md:h-1' : 'h-1',
            )}
          >
            <div
              className="h-full rounded-full bg-[#402D87] transition-all"
              style={{ width: `${statusBarWidth}%` }}
              role="progressbar"
              aria-valuenow={statusBarWidth}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Card status: ${displayStatus}`}
            />
          </div>
        </div>
        {!isPurchasable && !isExpired ? (
          <Text variant="span" className="text-[10px] text-amber-700 mb-2 block">
            Not available for purchase
          </Text>
        ) : null}
        <div
          className={cn(
            'flex w-full gap-2 border-t border-gray-100',
            isCompact
              ? 'flex-col pt-2 md:flex-row md:items-center md:justify-between md:pt-2.5'
              : 'items-center justify-between pt-2.5',
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-1.5 md:gap-2">
            <div
              className={cn(
                'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#402D87]/10',
                isCompact ? 'h-5 w-5 md:h-6 md:w-6' : 'h-6 w-6',
              )}
            >
              <VendorLogoImage
                vendor={vendorLogo}
                name={vendor_name || branch_name || 'Vendor'}
                className="h-full w-full object-cover"
                iconClassName={cn(
                  'text-[#402D87]',
                  isCompact ? 'text-[9px] md:text-[10px]' : 'text-[10px]',
                )}
                fallbackIcon="bi:shop"
              />
            </div>
            <Text
              variant="span"
              weight="semibold"
              className={cn(
                'text-gray-900 min-w-0 line-clamp-2',
                isCompact
                  ? 'text-[10px] leading-tight md:text-xs md:line-clamp-1 md:truncate'
                  : 'text-xs truncate',
              )}
            >
              {formatCardDisplayTitle(vendor_name || branch_name || 'Vendor')}
            </Text>
          </div>
          <Text
            variant="span"
            weight="bold"
            className={cn(
              'text-[#402D87] shrink-0',
              isCompact ? 'text-[11px] md:text-xs' : 'text-xs',
            )}
          >
            {displayPrice}
          </Text>
        </div>
      </div>
    </article>
  )
}
