import { useNavigate } from 'react-router-dom'

import { Text } from '@/components'
import { Icon } from '@/libs'
import { cn } from '@/libs/clsx'
import { ROUTES } from '@/utils/constants'

type QuickAction = {
  id: string
  label: string
  description: string
  icon: string
  iconClassName: string
  iconBgClassName: string
  to: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'buy',
    label: 'Buy cards',
    description: 'Browse and purchase gift cards',
    icon: 'bi:gift-fill',
    iconClassName: 'text-[#402D87]',
    iconBgClassName: 'bg-[#402D87]/10',
    to: ROUTES.IN_APP.DASHQARDS,
  },
  {
    id: 'my-cards',
    label: 'My cards',
    description: 'Balances and card details',
    icon: 'bi:credit-card-2-front',
    iconClassName: 'text-blue-600',
    iconBgClassName: 'bg-blue-50',
    to: ROUTES.IN_APP.DASHBOARD.MY_CARDS,
  },
  {
    id: 'redeem',
    label: 'Redeem',
    description: 'Apply a gift card code',
    icon: 'bi:arrow-repeat',
    iconClassName: 'text-emerald-600',
    iconBgClassName: 'bg-emerald-50',
    to: ROUTES.IN_APP.REDEEM,
  },
  {
    id: 'orders',
    label: 'Orders',
    description: 'Receipts and payment status',
    icon: 'bi:receipt',
    iconClassName: 'text-violet-600',
    iconBgClassName: 'bg-violet-50',
    to: ROUTES.IN_APP.DASHBOARD.ORDERS,
  },
]

export function UserQuickActions() {
  const navigate = useNavigate()

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
      <header className="border-b border-gray-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#402D87]/10">
            <Icon icon="bi:lightning-charge-fill" className="text-lg text-[#402D87]" />
          </div>
          <div>
            <Text variant="h6" weight="semibold" className="text-gray-900">
              Quick actions
            </Text>
            <p className="mt-0.5 text-xs text-gray-500">Shortcuts to common tasks</p>
          </div>
        </div>
      </header>

      <ul className="divide-y divide-gray-100 px-2 py-2">
        {QUICK_ACTIONS.map((action) => (
          <li key={action.id}>
            <button
              type="button"
              onClick={() => navigate(action.to)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left',
                'transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#402D87]/30',
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  action.iconBgClassName,
                )}
              >
                <Icon icon={action.icon} className={cn('text-base', action.iconClassName)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                <p className="truncate text-xs text-gray-500">{action.description}</p>
              </div>
              <Icon icon="bi:chevron-right" className="shrink-0 text-sm text-gray-300" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
