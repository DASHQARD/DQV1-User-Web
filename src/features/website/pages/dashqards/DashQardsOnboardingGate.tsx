import { useNavigate } from 'react-router-dom'
import { Button, Text } from '@/components'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'

type CardKind = 'DashPro' | 'DashGo'

export function DashQardsOnboardingGate({ cardKind }: { cardKind: CardKind }) {
  const navigate = useNavigate()

  return (
    <div className="w-full rounded-2xl border border-[#e6e6e6] bg-linear-to-br from-[#f8f9fa] to-white p-8 text-center shadow-sm max-md:p-6">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-[#402D87]/15 to-[#7950ed]/15">
        <Icon icon="bi:person-check" className="text-2xl text-[#402D87]" />
      </div>
      <Text variant="h3" weight="semibold" className="text-[#212529] mb-2">
        Complete your profile to create a custom {cardKind} card
      </Text>
      <p className="text-sm text-grey-500 mb-6 max-w-md mx-auto">
        Custom {cardKind} gift cards are available after you finish onboarding. Use your dashboard
        to complete your profile, then return here to customize and add your card to the cart.
      </p>
      <div className="flex justify-center max-w-md mx-auto">
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto min-w-[200px]"
          onClick={() => navigate(ROUTES.IN_APP.DASHBOARD.HOME)}
        >
          Go to dashboard
        </Button>
      </div>
    </div>
  )
}
