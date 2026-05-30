import { Text } from '@/components'
import { Icon } from '@/libs'
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
}: GuestGiftCardTileProps) {
  const firstImageUrl = images?.[0]?.file_url
  const typeKey = cardType?.toLowerCase()?.trim() || 'dashx'
  const vendorDisplay =
    vendorName?.trim() || (typeKey === 'dashpro' ? 'DashQard' : getCardTypeName(typeKey) || 'Vendor')

  return (
    <article className="flex flex-col bg-white overflow-hidden rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
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
    </article>
  )
}
