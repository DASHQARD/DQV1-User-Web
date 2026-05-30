import { Text } from '@/components'
import { cn, Icon } from '@/libs'
import { CardItemImage } from '@/features/website/components/CardItems/CardItemImage'
import { VendorLogoImage } from '@/features/website/components/VendorLogo/VendorLogoImage'
import { formatCardDisplayTitle, getCardTypeName } from '@/utils/cardDisplay'
import { formatCurrency, formatDate } from '@/utils/format'

export type GuestGiftCardTileProps = {
  product: string
  cardType: string
  amount: number
  currency?: string
  expiryDate?: string | null
  vendorName?: string | null
  images?: Array<{ file_url?: string; file_name?: string }>
  statusLabel?: string | null
  statusClassName?: string
  selected?: boolean
  onSelect?: () => void
}

export function GuestGiftCardTile({
  product,
  cardType,
  amount,
  currency = 'GHS',
  expiryDate,
  vendorName,
  images,
  statusLabel,
  statusClassName,
  selected = false,
  onSelect,
}: GuestGiftCardTileProps) {
  const firstImageUrl = images?.[0]?.file_url
  const typeKey = cardType?.toLowerCase()?.trim() || 'dashx'
  const vendorDisplay =
    vendorName?.trim() || (typeKey === 'dashpro' ? 'DashQard' : getCardTypeName(typeKey) || 'Vendor')

  const tileClassName = cn(
    'flex flex-col bg-white overflow-hidden rounded-xl border text-left transition-all',
    onSelect ? 'cursor-pointer hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]' : 'border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
    selected
      ? 'border-primary-500 ring-2 ring-primary-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
      : onSelect
        ? 'border-gray-200'
        : 'border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
  )

  const content = (
    <>
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <CardItemImage
          fileUrl={firstImageUrl}
          cardType={typeKey}
          alt={`${product} card`}
          className="h-full w-full object-cover"
        />
        {statusLabel ? (
          <span
            className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClassName ?? 'bg-white/90 text-gray-700'}`}
          >
            {statusLabel}
          </span>
        ) : null}
        {selected ? (
          <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 shadow-sm">
            <Icon icon="bi:check" className="text-sm text-white" />
          </span>
        ) : null}
      </div>

      <div className="flex flex-col p-3 pb-3.5">
        <span className="mb-2 inline-flex w-fit items-center gap-1 self-start rounded-full bg-[#402D87]/10 px-2 py-0.5 text-[10px] font-bold text-[#402D87]">
          <Icon icon="bi:briefcase-fill" className="text-[8px]" />
          {(cardType || 'DashX').toUpperCase()}
        </span>

        <Text variant="span" weight="semibold" className="mb-2 line-clamp-2 text-xs leading-snug text-gray-900">
          {product}
        </Text>

        {expiryDate ? (
          <Text variant="span" className="mb-2 flex items-center gap-0.5 text-[10px] text-gray-500">
            <Icon icon="bi:calendar-event" className="size-2.5" />
            Expires {formatDate(expiryDate)}
          </Text>
        ) : null}

        <div className="flex items-center gap-2 border-t border-gray-100 pt-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#402D87]/10">
              <VendorLogoImage
                vendor={{}}
                name={vendorDisplay}
                className="h-full w-full object-cover"
                iconClassName="text-[10px] text-[#402D87]"
                fallbackIcon="bi:shop"
              />
            </div>
            <Text variant="span" weight="semibold" className="min-w-0 truncate text-xs text-gray-900">
              {formatCardDisplayTitle(vendorDisplay)}
            </Text>
          </div>
          <Text variant="span" weight="bold" className="shrink-0 text-xs text-[#402D87]">
            {formatCurrency(amount, currency)}
          </Text>
        </div>
      </div>
    </>
  )

  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} className={cn('w-full', tileClassName)}>
        {content}
      </button>
    )
  }

  return <article className={tileClassName}>{content}</article>
}
