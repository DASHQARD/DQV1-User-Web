import { ROUTES } from './shared'

export const CORPORATE_NAV_ITEMS = [
  {
    section: 'Overview',
    items: [{ path: ROUTES.IN_APP.DASHBOARD.CORPORATE.HOME, label: 'Dashboard', icon: 'bi:grid' }],
  },
  {
    section: 'Transactions',
    items: [
      {
        path: ROUTES.IN_APP.DASHBOARD.CORPORATE.TRANSACTIONS,
        label: 'Transactions',
        icon: 'bi:receipt',
      },
      { path: ROUTES.IN_APP.DASHBOARD.CORPORATE.PURCHASE, label: 'Purchase', icon: 'bi:gift' },
    ],
  },
  {
    section: 'Management',
    items: [
      {
        path: ROUTES.IN_APP.DASHBOARD.CORPORATE.REQUESTS,
        label: 'Requests',
        icon: 'bi:clipboard-check',
      },
      {
        path: ROUTES.IN_APP.DASHBOARD.CORPORATE.AUDIT_LOGS,
        label: 'Audit Logs',
        icon: 'bi:journal-text',
      },
    ],
  },
]

export const USER_NAV_ITEMS = [
  {
    section: 'Gift Cards',
    items: [
      { path: ROUTES.IN_APP.DASHBOARD.ORDERS, label: 'My Orders', icon: 'bi:gift' },
      { path: ROUTES.IN_APP.DASHBOARD.REDEEM, label: 'Redeem', icon: 'bi:card-checklist' },
      { path: ROUTES.IN_APP.DASHBOARD.RECIPIENTS, label: 'Recipients', icon: 'bi:people-fill' },
      { path: ROUTES.IN_APP.DASHBOARD.TRANSACTIONS, label: 'Transactions', icon: 'bi:receipt' },
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
    items: [
      { path: ROUTES.IN_APP.DASHBOARD.VENDOR.HOME, label: 'Dashboard', icon: 'bi:speedometer2' },
    ],
  },
  {
    section: 'Experience',
    items: [
      {
        path: ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE,
        label: 'My Experience',
        icon: 'bi:briefcase-fill',
      },
    ],
  },
  {
    section: 'Branch Management',
    items: [
      {
        path: ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES,
        label: 'Branches',
        icon: 'bi:building',
      },
    ],
  },
  {
    section: 'Redemptions',
    items: [
      {
        path: ROUTES.IN_APP.DASHBOARD.VENDOR.REDEMPTIONS,
        label: 'Redemptions',
        icon: 'bi:arrow-left-right',
      },
    ],
  },
  {
    section: 'Management',
    items: [
      {
        path: ROUTES.IN_APP.DASHBOARD.VENDOR.REQUESTS,
        label: 'Requests',
        icon: 'bi:clipboard-check',
      },
      {
        path: ROUTES.IN_APP.DASHBOARD.VENDOR.AUDIT_LOGS,
        label: 'Audit Logs',
        icon: 'bi:journal-text',
      },
    ],
  },
  {
    section: 'Settings & Support',
    items: [
      { path: '/dashboard/settings', label: 'Settings', icon: 'bi:gear-fill' },
      {
        path: ROUTES.IN_APP.DASHBOARD.VENDOR.PAYMENT_METHODS,
        label: 'Payment Methods',
        icon: 'bi:credit-card-fill',
      },
    ],
  },
]
