import { Button, Text } from '@/components'
import { CardItemImage } from '@/features/website/components/CardItems/CardItemImage'
import { Icon } from '@/libs'
import { formatCardDisplayTitle } from '@/utils/cardDisplay'
import { getCardStatusBarWidth } from '@/utils/cardExpiry'
import { formatCurrency, formatDate } from '@/utils/format'

export type MyGiftCardTileProps = {
  cardTypeLabel: string
  cardType: string
  cardName: string
  imageUrl?: string | null
  balance?: number
  currency?: string
  expiryDate?: string
  displayStatus: string
  vendorName?: string
  branchName?: string
  canRedeem: boolean
  showBalance?: boolean
  onRedeem: () => void
}

export function MyGiftCardTile({
  cardTypeLabel,
  cardType,
  cardName,
  imageUrl,
  balance,
  currency = 'GHS',
  expiryDate,
  displayStatus,
  vendorName,
  branchName,
  canRedeem,
  showBalance = true,
  onRedeem,
}: MyGiftCardTileProps) {
  const isExpired = displayStatus === 'expired'
  const statusBarWidth = getCardStatusBarWidth(displayStatus)
  const vendorLabel = formatCardDisplayTitle(vendorName || branchName || 'Vendor')
  const formattedBalance =
    showBalance && balance != null ? formatCurrency(balance, currency) : null

  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <div className="relative aspect-video shrink-0 overflow-hidden bg-gray-100">
        {isExpired ? (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-gray-900/80 px-2 py-0.5 text-[10px] font-semibold text-white">
            Expired
          </span>
        ) : displayStatus !== 'active' ? (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-gray-900/80 px-2 py-0.5 text-[10px] font-semibold capitalize text-white">
            {displayStatus}
          </span>
        ) : null}
        <CardItemImage
          fileUrl={imageUrl}
          cardType={cardType}
          alt={`${cardName} card`}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col p-3 pb-4">
        <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-[#402D87]/10 px-2 py-0.5 text-[10px] font-bold text-[#402D87]">
          <Icon icon="bi:briefcase-fill" className="text-[8px]" />
          {cardTypeLabel.toUpperCase()}
        </span>

        <Text variant="span" weight="semibold" className="mb-2 line-clamp-2 text-xs leading-snug text-gray-900">
          {cardName}
        </Text>

        {expiryDate ? (
          <Text variant="span" className="mb-2 flex items-center gap-0.5 text-[10px] text-gray-500">
            <Icon icon="bi:calendar-event" className="size-2.5" />
            Expires {formatDate(expiryDate)}
          </Text>
        ) : null}

        <div className="mb-2">
          <div className="h-1 overflow-hidden rounded-full bg-gray-100">
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

        <div className="mb-3 flex w-full items-center justify-between gap-2 border-t border-gray-100 pt-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#402D87]/10">
              <Icon icon="bi:shop" className="text-[10px] text-[#402D87]" />
            </div>
            <Text variant="span" weight="semibold" className="min-w-0 truncate text-xs text-gray-900">
              {vendorLabel}
            </Text>
          </div>
          {formattedBalance ? (
            <Text variant="span" weight="bold" className="shrink-0 text-xs text-[#402D87]">
              {formattedBalance}
            </Text>
          ) : null}
        </div>

        <Button
          variant="secondary"
          disabled={!canRedeem}
          onClick={onRedeem}
          className="mt-auto flex w-full items-center justify-center gap-2"
        >
          <Icon icon="bi:arrow-repeat" />
          <span>Redeem Card</span>
        </Button>
      </div>
    </article>
  )
}
