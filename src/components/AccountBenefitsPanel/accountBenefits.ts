export type AccountBenefit = {
  icon: string
  title: string
  description: string
}

/** Benefits surfaced to guests during browse/checkout (see product AC2). */
export const ACCOUNT_BENEFITS: AccountBenefit[] = [
  {
    icon: 'bi:arrow-up-circle-fill',
    title: 'Higher transaction limits',
    description: 'Purchase beyond guest limits with higher daily and per-card amounts.',
  },
  {
    icon: 'bi:people-fill',
    title: 'Bulk gifting',
    description: 'Send gifts to up to 10 recipients in a single transaction.',
  },
  {
    icon: 'bi:clock-history',
    title: 'Gift history',
    description: 'Track your purchases, balances, and redemptions in one place.',
  },
  {
    icon: 'bi:bookmark-heart-fill',
    title: 'Saved recipients',
    description: 'Store recipient details and reuse them on future orders.',
  },
  {
    icon: 'bi:speedometer2',
    title: 'Dashboard access',
    description: 'Manage cards, orders, and account settings from your dashboard.',
  },
  {
    icon: 'bi:lightning-charge-fill',
    title: 'Faster future checkout',
    description: 'Saved profile and recipients make repeat gifting quicker.',
  },
]
