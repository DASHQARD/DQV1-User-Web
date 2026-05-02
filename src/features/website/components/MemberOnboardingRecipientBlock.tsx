import { useNavigate } from 'react-router-dom'
import { Button } from '@/components'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'

/** Inline notice when a member must finish onboarding before assigning recipients or checking out. */
export function MemberOnboardingRecipientBlock() {
  const navigate = useNavigate()

  return (
    <div
      role="status"
      className="rounded-xl border border-primary-200 bg-primary-50/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
    >
      <div className="flex items-start gap-3 min-w-0">
        <Icon icon="bi:person-lines-fill" className="text-lg text-primary-600 shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700 leading-relaxed">
          Complete your profile onboarding in the dashboard before you can assign recipients or
          finish checkout for these gift cards.
        </p>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="small"
        className="shrink-0 w-full sm:w-auto"
        onClick={() => navigate(ROUTES.IN_APP.DASHBOARD.HOME)}
      >
        Go to dashboard
      </Button>
    </div>
  )
}
