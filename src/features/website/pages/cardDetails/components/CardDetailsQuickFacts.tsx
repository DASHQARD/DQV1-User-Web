import { Icon } from '@/libs'
import { formatCurrency } from '@/utils/format'
import type { CardPriceBreakdown } from '@/features/website/types/cardDetails'
import { CARD_DETAILS_PANEL } from '../cardDetailsUtils'

type QuickFact = {
  icon: string
  label: string
  value: string
}

type CardDetailsQuickFactsProps = {
  facts: QuickFact[]
  priceBreakdown: CardPriceBreakdown | null
}

export function CardDetailsQuickFacts({ facts, priceBreakdown }: CardDetailsQuickFactsProps) {
  if (facts.length === 0 && !priceBreakdown) return null

  return (
    <section className={`${CARD_DETAILS_PANEL} space-y-3 md:space-y-4`}>
      {facts.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 max-md:gap-y-2.5">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="flex gap-2 min-w-0 md:gap-2.5 md:rounded-xl md:bg-gray-50 md:p-3"
            >
              <Icon
                icon={fact.icon}
                className="text-primary-600 text-base shrink-0 mt-0.5 md:hidden"
              />
              <div className="hidden md:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-100">
                <Icon icon={fact.icon} className="text-primary-600 text-base" />
              </div>
              <div className="min-w-0">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                  {fact.label}
                </dt>
                <dd className="text-sm font-semibold text-gray-900 truncate">{fact.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      )}

      {priceBreakdown && (
        <div className="space-y-2 max-md:pt-3 max-md:border-t max-md:border-gray-200 md:rounded-xl md:border md:border-gray-100 md:bg-gray-50/80 md:p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Price breakdown
          </p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-2 text-gray-600">
              <span>Card value</span>
              <span className="font-medium text-gray-900 tabular-nums">
                {formatCurrency(priceBreakdown.basePrice, priceBreakdown.currency)}
              </span>
            </div>
            {priceBreakdown.markupPrice > 0 && (
              <div className="flex justify-between gap-2 text-gray-600">
                <span>Platform fee</span>
                <span className="font-medium text-gray-900 tabular-nums">
                  {formatCurrency(priceBreakdown.markupPrice, priceBreakdown.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-2 border-t border-gray-200 pt-2 font-semibold text-gray-900">
              <span>Total</span>
              <span className="tabular-nums">
                {formatCurrency(priceBreakdown.totalPrice, priceBreakdown.currency)}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
