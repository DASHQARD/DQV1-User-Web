import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button, EmptyState, Loader, Text } from '@/components'
import { Icon } from '@/libs'
import { EmptyStateImage } from '@/assets/images'
import { ROUTES } from '@/utils/constants'
import { formatCurrency, formatDate } from '@/utils/format'
import { useGuestQueries } from '@/features/website/hooks/useGuestQueries'
import { useRedemptionQueries } from '@/features/dashboard/hooks/redemption/useRedemptionQueries'
import {
  parseGuestAssignedCardsResponse,
  type GuestAssignedCard,
} from '@/features/website/utils/guestAssignedCards'

type GuestCreatedCardRow = {
  id?: string
  guest_card_id?: string | number
  card_type?: string
  product?: string
  amount?: string | number
  price?: string | number
  currency?: string
  status?: string
  created_at?: string
  issue_date?: string
}

function normalizeCreatedCards(data: unknown): GuestCreatedCardRow[] {
  if (!data) return []
  if (Array.isArray(data)) return data as GuestCreatedCardRow[]
  const nested = (data as { data?: unknown })?.data
  return Array.isArray(nested) ? (nested as GuestCreatedCardRow[]) : []
}

function formatSourceLabel(source?: string): string | null {
  if (!source) return null
  if (source === 'guest') return 'Guest checkout'
  if (source === 'user') return 'Member gift'
  return source.replace(/_/g, ' ')
}

export default function GuestCardsPage() {
  const { useGetGuestCardsService } = useGuestQueries()
  const { useGetGuestAssignedCardsService } = useRedemptionQueries()
  const { data: createdCardsRaw, isLoading: isLoadingCreated } = useGetGuestCardsService()
  const { data: assignedResponse, isLoading: isLoadingAssigned } = useGetGuestAssignedCardsService()

  const createdCards = useMemo(() => normalizeCreatedCards(createdCardsRaw), [createdCardsRaw])
  const assignedPayload = useMemo(
    () => parseGuestAssignedCardsResponse(assignedResponse),
    [assignedResponse],
  )
  const assignedCards = assignedPayload.cards
  const assignedCurrency = assignedPayload.currency ?? 'GHS'

  const isLoading = isLoadingCreated || isLoadingAssigned

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
            <h1 className="text-[clamp(28px,5vw,42px)] font-bold mb-2">My Cards</h1>
            <p className="text-lg opacity-90">Cards you created and cards assigned to your phone</p>
          </div>
        </div>
      </div>

      <div className="wrapper py-10 space-y-10">
        <section>
          <Text variant="h3" weight="semibold" className="text-gray-900 mb-1">
            Cards you created
          </Text>
          <Text variant="p" className="text-gray-600 mb-6 text-sm">
            Custom DashGo and DashPro cards from your guest checkout.
          </Text>
          {createdCards.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <EmptyState
                image={EmptyStateImage}
                title="No created cards yet"
                description="Browse gift cards and add items to your bag to create custom cards."
              />
              <div className="flex justify-center mt-4">
                <Link to={ROUTES.IN_APP.DASHQARDS}>
                  <Button variant="secondary" className="rounded-full">
                    Browse gift cards
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {createdCards.map((card) => {
                const id = String(card.id ?? card.guest_card_id ?? '')
                const amount = card.amount ?? card.price ?? 0
                const currency = card.currency ?? 'GHS'
                return (
                  <article
                    key={id || `${card.product}-${card.created_at}`}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <Text variant="span" weight="semibold" className="block text-gray-900">
                        {card.product || card.card_type || 'Gift card'}
                      </Text>
                      <Text variant="span" className="text-sm text-gray-500 block mt-1">
                        {card.card_type}
                        {card.status ? ` · ${card.status}` : ''}
                      </Text>
                      {(card.created_at || card.issue_date) && (
                        <Text variant="span" className="text-xs text-gray-400 block mt-1">
                          {formatDate(card.created_at || card.issue_date || '')}
                        </Text>
                      )}
                    </div>
                    <Text variant="h5" weight="semibold" className="text-primary-600">
                      {formatCurrency(Number(amount), currency)}
                    </Text>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <Text variant="h3" weight="semibold" className="text-gray-900 mb-1">
                Cards on your phone
              </Text>
              <Text variant="p" className="text-gray-600 text-sm">
                Gift cards assigned to you as a recipient.
              </Text>
            </div>
            <Link to={ROUTES.IN_APP.REDEEM}>
              <Button variant="secondary" className="rounded-full flex items-center gap-2">
                <Icon icon="bi:arrow-left-right" />
                Redeem
              </Button>
            </Link>
          </div>
          {assignedCards.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <Text variant="p" className="text-gray-600">
                No cards are assigned to your phone yet. When someone sends you a gift card, it will
                appear here.
              </Text>
            </div>
          ) : (
            <div className="grid gap-4">
              {assignedCards.map((card: GuestAssignedCard, index) => {
                const key = String(card.guest_recipient_id ?? card.gift_card_id ?? index)
                const balance = card.balance ?? card.amount ?? card.price ?? 0
                const cardType = card.card_type ?? ''
                const showBalance =
                  cardType === 'DashGo' || cardType === 'DashPro' || card.balance != null
                const locationLabel =
                  card.vendor_name ||
                  card.branch_name ||
                  card.branch_location ||
                  (card.vendor_id ? 'Vendor gift card' : null)
                const sourceLabel = formatSourceLabel(card.source)

                return (
                  <article
                    key={key}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-wrap items-start justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Text variant="span" weight="semibold" className="text-gray-900">
                          {card.product || card.card_type || 'Gift card'}
                        </Text>
                        {cardType ? (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700">
                            {cardType}
                          </span>
                        ) : null}
                        {sourceLabel ? (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {sourceLabel}
                          </span>
                        ) : null}
                      </div>
                      {locationLabel ? (
                        <Text variant="span" className="text-sm text-gray-500 block">
                          {locationLabel}
                        </Text>
                      ) : null}
                      {card.assigned_at ? (
                        <Text variant="span" className="text-xs text-gray-400 block mt-1">
                          Assigned {formatDate(card.assigned_at)}
                        </Text>
                      ) : null}
                      {card.redemption_code ? (
                        <Text variant="span" className="text-xs text-gray-600 block mt-1 font-mono">
                          Code: {card.redemption_code}
                        </Text>
                      ) : null}
                      {card.expiry_date ? (
                        <Text variant="span" className="text-xs text-gray-400 block mt-1">
                          Expires {formatDate(card.expiry_date)}
                        </Text>
                      ) : null}
                    </div>
                    <div className="text-right shrink-0">
                      <Text variant="h5" weight="semibold" className="text-primary-600">
                        {formatCurrency(Number(balance), card.currency ?? assignedCurrency)}
                      </Text>
                      {showBalance ? (
                        <Text variant="span" className="text-xs text-gray-500 block">
                          Balance
                        </Text>
                      ) : (
                        <Text variant="span" className="text-xs text-gray-500 block">
                          Value
                        </Text>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
