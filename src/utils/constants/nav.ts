import { ROUTES } from './shared'

export const CORPORATE_NAV_ITEMS = [
  {
    section: 'Overview',
    items: [{ path: ROUTES.IN_APP.DASHBOARD.HOME, label: 'Dashboard', icon: 'bi:grid' }],
  },
  {
    section: 'Transactions',
    items: [
      { path: '/dashboard/transactions', label: 'Transactions', icon: 'bi:receipt' },
      { path: ROUTES.IN_APP.DASHBOARD.PURCHASE, label: 'Purchase', icon: 'bi:gift' },
    ],
  },
  {
    section: 'Management',
    items: [
      {
        path: ROUTES.IN_APP.DASHBOARD.BRANCHES,
        label: 'Branches',
        icon: 'bi:building',
      },
    ],
  },
  // {
  //   section: 'Subscriptions',
  //   items: [
  //     {
  //       path: '/dashboard/subscriptions',
  //       label: 'Subscriptions',
  //       icon: 'bi:credit-card-2-front',
  //     },
  //   ],
  // },
]

export const REGULAR_NAV_ITEMS = [
  {
    section: 'Gift Cards',
    items: [
      { path: ROUTES.IN_APP.DASHBOARD.ORDERS, label: 'My Orders', icon: 'bi:gift' },
      { path: ROUTES.IN_APP.DASHBOARD.REDEEM, label: 'Redeem', icon: 'bi:card-checklist' },
      { path: ROUTES.IN_APP.DASHBOARD.RECIPIENTS, label: 'Recipients', icon: 'bi:people-fill' },
      { path: '/dashboard/transactions', label: 'Transactions', icon: 'bi:receipt' },
    ],
  },
  {
    section: 'Account',
    items: [{ path: '/dashboard/notifications', label: 'Notifications', icon: 'bi:bell-fill' }],
  },
  {
    section: 'Settings & Support',
    items: [{ path: '/dashboard/settings', label: 'Settings', icon: 'bi:gear-fill' }],
  },
]

export const VENDOR_NAV_ITEMS = [
  {
    section: 'Overview',
    items: [{ path: ROUTES.IN_APP.DASHBOARD.HOME, label: 'Dashboard', icon: 'bi:speedometer2' }],
  },
  {
    section: 'Experience',
    items: [
      {
        path: ROUTES.IN_APP.DASHBOARD.EXPERIENCE,
        label: 'My Experience',
        icon: 'bi:briefcase-fill',
      },
    ],
  },
  {
    section: 'Management',
    items: [
      {
        path: ROUTES.IN_APP.DASHBOARD.BRANCHES,
        label: 'Branches',
        icon: 'bi:building',
      },
    ],
  },
  {
    section: 'Redemptions',
    items: [
      {
        path: ROUTES.IN_APP.DASHBOARD.REDEMPTIONS,
        label: 'Redemptions',
        icon: 'bi:arrow-left-right',
      },
    ],
  },
  {
    section: 'Transactions',
    items: [
      {
        path: ROUTES.IN_APP.DASHBOARD.REDEMPTION_TRANSACTIONS,
        label: 'Redemption Transactions',
        icon: 'bi:receipt',
      },
    ],
  },
  {
    section: 'Settings & Support',
    items: [
      { path: '/dashboard/settings', label: 'Settings', icon: 'bi:gear-fill' },
      {
        path: ROUTES.IN_APP.DASHBOARD.PAYMENT_METHODS,
        label: 'Payment Methods',
        icon: 'bi:credit-card-fill',
      },
    ],
  },
]
