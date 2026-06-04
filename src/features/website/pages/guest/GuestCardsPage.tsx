import { useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, EmptyState, Loader, Text } from '@/components'
import { Icon } from '@/libs'
import { EmptyStateImage } from '@/assets/images'
import { ROUTES } from '@/utils/constants'
import { useGuestQueries } from '@/features/website/hooks/useGuestQueries'
import { useRedemptionQueries } from '@/features/dashboard/hooks/redemption/useRedemptionQueries'
import {
  parseGuestAssignedCardsResponse,
  type GuestAssignedCard,
} from '@/features/website/utils/guestAssignedCards'
import {
  formatGuestCardStatusLabel,
  getGuestCreatedCardRowKey,
  type GuestCreatedCard,
} from '@/features/website/utils/guestCreatedCards'
import { isAssignedCardRedeemable, resolveCardDisplayStatus } from '@/utils/cardExpiry'
import { GuestGiftCardTile } from './GuestGiftCardTile'
import {
  buildRedemptionUrlFromGuestAssignedCard,
  buildRedemptionUrlFromGuestPurchasedCard,
  isGuestAssignedCardRedeemNavigable,
  isGuestPurchasedCardRedeemNavigable,
} from '@/features/website/utils/guestCardRedemptionNavigation'
import { useToast } from '@/hooks'

function guestStatusBadgeClass(status: string): string {
  const normalized = status.toLowerCase()
  if (normalized === 'pending') return 'bg-amber-50 text-amber-800'
  if (normalized === 'paid' || normalized === 'active' || normalized === 'approved') {
    return 'bg-emerald-50 text-emerald-800'
  }
  if (normalized === 'cancelled' || normalized === 'failed') return 'bg-red-50 text-red-700'
  return 'bg-gray-100 text-gray-600'
}

function PurchasedGuestCardTile({
  card,
  onRedeem,
}: {
  card: GuestCreatedCard
  onRedeem: (card: GuestCreatedCard) => void
}) {
  const statusLabel = card.status ? formatGuestCardStatusLabel(card.status) : null
  const canRedeem = isGuestPurchasedCardRedeemNavigable(card)

  return (
    <GuestGiftCardTile
      product={card.product}
      cardType={card.card_type}
      amount={card.amount || card.price}
      currency={card.currency}
      expiryDate={card.expiry_date}
      vendorName={card.vendor_name}
      images={card.images}
      redemptionCode={card.redemption_code}
      statusLabel={statusLabel}
      statusClassName={statusLabel ? guestStatusBadgeClass(card.status) : undefined}
      onSelect={canRedeem ? () => onRedeem(card) : undefined}
    />
  )
}

function AssignedGuestCardTile({
  card,
  currency,
  onRedeem,
}: {
  card: GuestAssignedCard
  currency: string
  onRedeem: (card: GuestAssignedCard) => void
}) {
  const balance = card.balance ?? card.amount ?? card.price ?? 0
  const displayStatus = resolveCardDisplayStatus(card.status, card.expiry_date)
  const redeemable = isAssignedCardRedeemable(card)
  const canNavigate = isGuestAssignedCardRedeemNavigable(card)

  const statusLabel = card.redeemed
    ? 'Redeemed'
    : !redeemable
      ? displayStatus === 'expired'
        ? 'Expired'
        : 'Not redeemable'
      : undefined

  return (
    <GuestGiftCardTile
      product={card.product || card.card_type || 'Gift card'}
      cardType={card.card_type || 'DashX'}
      amount={Number(balance)}
      currency={card.currency ?? currency}
      expiryDate={card.expiry_date}
      vendorName={card.vendor_name || card.branch_name}
      images={card.images}
      redemptionCode={card.redemption_code}
      statusLabel={statusLabel}
      statusClassName={
        card.redeemed
          ? 'bg-gray-100 text-gray-700'
          : !redeemable
            ? 'bg-red-50 text-red-800'
            : undefined
      }
      onSelect={canNavigate ? () => onRedeem(card) : undefined}
    />
  )
}

export default function GuestCardsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { useGetGuestCardsService } = useGuestQueries()
  const { useGetGuestAssignedCardsService } = useRedemptionQueries()
  const { data: createdCards = [], isLoading: isLoadingCreated } = useGetGuestCardsService()
  const { data: assignedResponse, isLoading: isLoadingAssigned } = useGetGuestAssignedCardsService()

  const assignedPayload = useMemo(
    () => parseGuestAssignedCardsResponse(assignedResponse),
    [assignedResponse],
  )
  const assignedCards = assignedPayload.cards
  const assignedCurrency = assignedPayload.currency ?? 'GHS'

  const isLoading = isLoadingCreated || isLoadingAssigned

  const navigateToRedeemFromPurchased = useCallback(
    (card: GuestCreatedCard) => {
      const url = buildRedemptionUrlFromGuestPurchasedCard(card)
      if (!url) {
        toast.error('This card cannot be redeemed from here yet.')
        return
      }
      navigate(url)
    },
    [navigate, toast],
  )

  const navigateToRedeemFromAssigned = useCallback(
    (card: GuestAssignedCard) => {
      const url = buildRedemptionUrlFromGuestAssignedCard(card)
      if (!url) {
        toast.error('This card cannot be redeemed from here yet.')
        return
      }
      navigate(url)
    },
    [navigate, toast],
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
            <h1 className="text-[clamp(28px,5vw,42px)] font-bold mb-2">My Cards</h1>
            <p className="text-lg opacity-90">
              Cards you purchased and cards assigned to your phone
            </p>
          </div>
        </div>
      </div>

      <div className="wrapper py-10 space-y-10">
        <section>
          <Text variant="h3" weight="semibold" className="text-gray-900 mb-1">
            Purchased cards
          </Text>
          <Text variant="p" className="text-gray-600 mb-6 text-sm">
            Gift cards from your guest checkout, including DashX, DashPass, DashGo, and DashPro.
          </Text>
          {createdCards.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <EmptyState
                image={EmptyStateImage}
                title="No purchased cards yet"
                description="Browse gift cards and complete checkout to see your cards here."
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {createdCards.map((card, index) => (
                <PurchasedGuestCardTile
                  key={getGuestCreatedCardRowKey(card, index)}
                  card={card}
                  onRedeem={navigateToRedeemFromPurchased}
                />
              ))}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {assignedCards.map((card: GuestAssignedCard, index) => {
                const key = String(card.guest_recipient_id ?? card.gift_card_id ?? index)
                return (
                  <AssignedGuestCardTile
                    key={key}
                    card={card}
                    currency={assignedCurrency}
                    onRedeem={navigateToRedeemFromAssigned}
                  />
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
