import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button, EmptyState, Loader, Text } from '@/components'
import { Icon } from '@/libs'
import { EmptyStateImage } from '@/assets/images'
import { ROUTES } from '@/utils/constants'
import { formatCurrency, formatDate } from '@/utils/format'
import { useRedemptionQueries } from '@/features/dashboard/hooks/redemption/useRedemptionQueries'
import {
  formatRedemptionStatusLabel,
  parseGuestRedemptionsResponse,
  redemptionStatusTone,
  type GuestRedemptionHistoryItem,
} from '@/features/website/utils/guestRedemptionsHistory'

const STATUS_STYLES = {
  success: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  neutral: 'bg-gray-100 text-gray-700',
} as const

function formatMethodLabel(method?: string): string | null {
  if (!method) return null
  return method.replace(/_/g, ' ')
}

function formatSourceLabel(source?: string): string | null {
  if (!source) return null
  if (source === 'guest') return 'Guest'
  if (source === 'user') return 'Member'
  return source
}

export default function GuestOrdersPage() {
  const { useGetGuestRedemptionsService } = useRedemptionQueries()
  const { data: redemptionsResponse, isLoading } = useGetGuestRedemptionsService(true, {
    limit: 50,
  })

  const { items: redemptions, pagination } = useMemo(
    () => parseGuestRedemptionsResponse(redemptionsResponse),
    [redemptionsResponse],
  )

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-linear-to-br from-primary-500 to-primary-700 text-white py-12">
        <div className="wrapper">
          <div className="text-center">
            <h1 className="text-[clamp(28px,5vw,42px)] font-bold mb-2">My Orders</h1>
            <p className="text-lg opacity-90">Redemption history linked to your phone</p>
          </div>
        </div>
      </div>

      <div className="wrapper py-10">
        <Text variant="p" className="text-sm text-gray-600 mb-6 max-w-2xl">
          Purchase confirmations are sent to your email after checkout. This page lists redemptions
          you have made with cards assigned to your phone.
        </Text>

        {redemptions.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <EmptyState
              image={EmptyStateImage}
              title="No redemptions yet"
              description="When you redeem gift cards at a branch or by transfer, they will appear here."
            />
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <Link to={ROUTES.IN_APP.DASHQARDS}>
                <Button variant="primary" className="rounded-full">
                  <Icon icon="bi:bag-heart" className="mr-2" />
                  Browse cards
                </Button>
              </Link>
              <Link to={ROUTES.IN_APP.REDEEM}>
                <Button variant="outline" className="rounded-full">
                  Redeem a card
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <Text variant="span" className="text-sm text-gray-500 block mb-4">
              Showing {redemptions.length} redemption{redemptions.length === 1 ? '' : 's'}
              {pagination.limit != null ? ` (limit ${pagination.limit})` : ''}
            </Text>
            <div className="grid gap-4">
              {redemptions.map((row: GuestRedemptionHistoryItem) => {
                const key = row.redemption_id ?? row.transaction_reference ?? row.redemption_date
                const tone = redemptionStatusTone(row.status)
                const statusClass = STATUS_STYLES[tone]
                const location = [row.branch_name, row.branch_location].filter(Boolean).join(', ')
                const sourceLabel = formatSourceLabel(row.source)
                const methodLabel = formatMethodLabel(row.redemption_method)

                return (
                  <article
                    key={key}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-wrap items-start justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Text variant="span" weight="semibold" className="text-gray-900">
                          {row.product || row.card_type || 'Gift card'}
                        </Text>
                        {row.card_type ? (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700">
                            {row.card_type}
                          </span>
                        ) : null}
                        {row.status ? (
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusClass}`}
                          >
                            {formatRedemptionStatusLabel(row.status)}
                          </span>
                        ) : null}
                        {sourceLabel ? (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {sourceLabel}
                          </span>
                        ) : null}
                      </div>
                      {location ? (
                        <Text variant="span" className="text-sm text-gray-500 block">
                          {location}
                        </Text>
                      ) : null}
                      {row.redemption_date ? (
                        <Text variant="span" className="text-xs text-gray-400 block mt-1">
                          {formatDate(row.redemption_date)}
                          {methodLabel ? ` · ${methodLabel}` : ''}
                        </Text>
                      ) : null}
                      {row.transaction_reference ? (
                        <Text variant="span" className="text-xs text-gray-500 block mt-1 font-mono truncate max-w-full">
                          Ref: {row.transaction_reference}
                        </Text>
                      ) : null}
                      {row.redemption_code ? (
                        <Text variant="span" className="text-xs text-gray-600 block mt-1 font-mono">
                          Code: {row.redemption_code}
                        </Text>
                      ) : null}
                    </div>
                    <div className="text-right shrink-0">
                      <Text variant="h5" weight="semibold" className="text-primary-600">
                        {formatCurrency(Number(row.amount ?? 0), 'GHS')}
                      </Text>
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
