export const MODALS = {
  TRANSACTION: {
    PARAM_NAME: 'transaction',
    CHILDREN: {
      VIEW: 'view',
    },
  },
  PURCHASE: {
    PARAM_NAME: 'purchase',
    CHILDREN: {
      VIEW: 'view',
    },
  },
  REDEMPTION: {
    PARAM_NAME: 'redemption',
    CHILDREN: {
      VIEW: 'view',
    },
  },
  REQUEST: {
    PARAM_NAME: 'request',
    CHILDREN: {
      VIEW: 'view',
      APPROVE: 'approve',
      REJECT: 'reject',
    },
  },
  BRANCH: {
    ROOT: 'branch-modal',
    CREATE: 'create-branch',
    BULK_UPLOAD: 'bulk-upload-branches',
  },
  VENDOR_ACCOUNT: {
    ROOT: 'vendor-account-modal',
    CREATE: 'create-vendor-account',
  },
  EXPERIENCE: {
    ROOT: 'experience-modal',
    CREATE: 'create-experience',
    APPROVAL: 'experience-approval',
  },
  PAYMENT: {
    ROOT: 'payment-modal',
    VIEW: 'view-payment',
  },
  SUMMARY_CARDS: {
    ROOT: 'summary-cards-modal',
    VIEW: 'view-summary-cards',
  },
  BULK_GIFT_CARDS: {
    ROOT: 'bulk-gift-cards-modal',
    UPLOAD: 'bulk-gift-cards-upload',
  },
  NOTIFICATIONS: {
    ROOT: 'notifications-modal',
    PAYMENT_CHANGE: 'payment-change-notification',
  },
  LOGOUT: {
    ROOT: 'logout-modal',
    CONFIRM: 'confirm-logout',
  },
}
