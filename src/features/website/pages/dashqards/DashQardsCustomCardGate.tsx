import { useNavigate } from 'react-router-dom'
import { Button, Text } from '@/components'
import { Icon } from '@/libs'
import { useGuestAddToCartModalStore } from '@/stores'
import { ROUTES } from '@/utils/constants'

type CardKind = 'DashPro' | 'DashGo'

export function DashQardsCustomCardGate({ cardKind }: { cardKind: CardKind }) {
  const navigate = useNavigate()
  const openGuestModal = useGuestAddToCartModalStore((s) => s.open)

  const handleContinueAsGuest = () => {
    openGuestModal({
      card_id: 0,
      product: `Custom ${cardKind}`,
      price: 0,
      type: cardKind.toLowerCase(),
      authOnly: true,
    })
  }

  return (
    <div className="w-full rounded-2xl border border-[#e6e6e6] bg-linear-to-br from-[#f8f9fa] to-white p-8 text-center shadow-sm max-md:p-6">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-[#402D87]/15 to-[#7950ed]/15">
        <Icon icon="bi:gift" className="text-2xl text-[#402D87]" />
      </div>
      <Text variant="h3" weight="semibold" className="text-[#212529] mb-2">
        Sign in to create a custom {cardKind} card
      </Text>
      <p className="text-sm text-grey-500 mb-6 max-w-md mx-auto">
        Custom {cardKind} gift cards require an account or a verified guest session. Choose an
        option below to continue.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center max-w-md mx-auto">
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:flex-1"
          onClick={() => navigate(ROUTES.IN_APP.AUTH.LOGIN)}
        >
          Sign in
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:flex-1 border-[#402D87]/30 text-[#402D87] hover:bg-[#402D87]/5"
          onClick={handleContinueAsGuest}
        >
          Continue as guest
        </Button>
      </div>
    </div>
  )
}
