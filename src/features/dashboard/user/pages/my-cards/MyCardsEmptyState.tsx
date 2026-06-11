import { Button, EmptyState } from '@/components'
import { EmptyStateImage } from '@/assets/images'
import { Icon } from '@/libs'
import { cn } from '@/libs'

type TabEmptyStateProps = {
  icon: string
  iconTone?: 'primary' | 'muted'
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'outline'
  }
}

function TabEmptyState({
  icon,
  iconTone = 'primary',
  title,
  description,
  action,
}: TabEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-primary-50/70 via-white to-gray-50 px-6 py-14 text-center shadow-sm md:px-12">
      <div
        className={cn(
          'mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ring-8',
          iconTone === 'primary'
            ? 'bg-primary-100/80 text-primary-600 ring-primary-50'
            : 'bg-gray-100 text-gray-500 ring-gray-50',
        )}
      >
        <Icon icon={icon} className="text-4xl" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500">{description}</p>
      {action ? (
        <div className="mt-8">
          <Button variant={action.variant ?? 'primary'} onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

type MyCardsEmptyStateProps = {
  cardTypeName: string
  statusTab: 'active' | 'inactive'
  activeCount: number
  inactiveCount: number
  onSwitchTab: (tab: 'active' | 'inactive') => void
  onBrowseCards: () => void
}

export function MyCardsEmptyState({
  cardTypeName,
  statusTab,
  activeCount,
  inactiveCount,
  onSwitchTab,
  onBrowseCards,
}: MyCardsEmptyStateProps) {
  const hasAnyCards = activeCount + inactiveCount > 0

  if (!hasAnyCards) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white px-6 py-10 shadow-sm md:px-12">
        <EmptyState
          image={EmptyStateImage}
          title={`No ${cardTypeName} cards yet`}
          description={`When you receive or purchase ${cardTypeName} gift cards, they will show up here for you to view and redeem.`}
        />
        <div className="mt-2 flex justify-center">
          <Button variant="secondary" onClick={onBrowseCards}>
            Browse gift cards
          </Button>
        </div>
      </div>
    )
  }

  if (statusTab === 'inactive') {
    return (
      <TabEmptyState
        icon="bi:archive"
        iconTone="muted"
        title="No inactive cards"
        description={`Redeemed, expired, or deactivated ${cardTypeName} cards will appear here. Your active cards are ready to use on the other tab.`}
        action={
          activeCount > 0
            ? {
                label: `View active cards (${activeCount})`,
                onClick: () => onSwitchTab('active'),
              }
            : undefined
        }
      />
    )
  }

  return (
    <TabEmptyState
      icon="bi:gift"
      title="No active cards"
      description={`None of your ${cardTypeName} cards are ready to redeem right now. Check the inactive tab for redeemed or expired cards.`}
      action={
        inactiveCount > 0
          ? {
              label: `View inactive cards (${inactiveCount})`,
              onClick: () => onSwitchTab('inactive'),
              variant: 'outline',
            }
          : undefined
      }
    />
  )
}
