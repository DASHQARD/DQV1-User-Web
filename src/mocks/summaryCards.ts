export type SummaryCardStatus = 'active' | 'inactive' | 'pending' | 'suspended'

export interface SummaryCard {
  id: string
  title: string
  status: SummaryCardStatus
  icon: string
  secondaryInfo?: string
  amount: number
  currency: string
  illustration?: string
  hasOptions?: boolean
}

export const SUMMARY_CARDS_MOCKS: SummaryCard[] = [
  {
    id: '1',
    title: 'Available Balance',
    status: 'active',
    icon: 'bi:wallet2',
    secondaryInfo: 'Ready to use',
    amount: 2157262.41,
    currency: 'GHS',
    hasOptions: true,
  },
  {
    id: '2',
    title: 'Total Purchased',
    status: 'active',
    icon: 'bi:cart-plus',
    secondaryInfo: 'All time',
    amount: 5430750.25,
    currency: 'GHS',
    hasOptions: true,
  },
  {
    id: '3',
    title: 'Total Redeemed',
    status: 'active',
    icon: 'bi:credit-card-2-front',
    secondaryInfo: 'At vendors',
    amount: 3273587.84,
    currency: 'GHS',
    hasOptions: true,
  },
  {
    id: '4',
    title: 'Pending Redemptions',
    status: 'pending',
    icon: 'bi:clock-history',
    secondaryInfo: 'In process',
    amount: 125000.0,
    currency: 'GHS',
    hasOptions: true,
  },
]
