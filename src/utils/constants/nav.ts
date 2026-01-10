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
      {
        path: ROUTES.IN_APP.DASHBOARD.CORPORATE.RECIPIENTS,
        label: 'Recipients',
        icon: 'bi:person-lines-fill',
      },
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
      {
        path: ROUTES.IN_APP.DASHBOARD.CORPORATE.ADMINS,
        label: 'Admins',
        icon: 'bi:people-fill',
      },
      {
        path: ROUTES.IN_APP.DASHBOARD.CORPORATE.NOTIFICATIONS,
        label: 'Notifications',
        icon: 'bi:bell-fill',
      },
    ],
  },
]

export const USER_NAV_ITEMS = [
  {
    section: 'Overview',
    items: [{ path: ROUTES.IN_APP.DASHBOARD.HOME, label: 'Dashboard', icon: 'bi:speedometer2' }],
  },
  {
    section: 'Gift Cards',
    items: [
      { path: ROUTES.IN_APP.DASHBOARD.MY_CARDS, label: 'Cards', icon: 'bi:credit-card-2-front' },
      { path: ROUTES.IN_APP.DASHBOARD.ORDERS, label: 'My Orders', icon: 'bi:gift' },
      {
        path: ROUTES.IN_APP.DASHBOARD.REDEMPTIONS,
        label: 'Redemptions',
        icon: 'bi:arrow-left-right',
      },
      // { path: ROUTES.IN_APP.DASHBOARD.RECIPIENTS, label: 'Recipients', icon: 'bi:people-fill' },
      // { path: ROUTES.IN_APP.DASHBOARD.TRANSACTIONS, label: 'Transactions', icon: 'bi:receipt' },
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
      {
        path: ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCH_MANAGERS,
        label: 'Branch Managers',
        icon: 'bi:people-fill',
      },
      {
        path: ROUTES.IN_APP.DASHBOARD.VENDOR.INVITE_BRANCH_MANAGER,
        label: 'Create Branch',
        icon: 'bi:building-add',
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
    section: 'Payments',
    items: [
      {
        path: ROUTES.IN_APP.DASHBOARD.VENDOR.PAYMENTS,
        label: 'Payments',
        icon: 'bi:credit-card',
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
        path: ROUTES.IN_APP.DASHBOARD.VENDOR.INVITE_ADMIN,
        label: 'Invite Admin',
        icon: 'bi:person-plus-fill',
      },
      {
        path: ROUTES.IN_APP.DASHBOARD.VENDOR.AUDIT_LOGS,
        label: 'Audit Logs',
        icon: 'bi:journal-text',
      },
    ],
  },
]
