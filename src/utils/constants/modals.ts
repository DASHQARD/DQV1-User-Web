export const MODALS = {
  REQUEST_CORPORATE_MANAGEMENT: {
    ROOT: 'request-corporate-management-modal',
    CHILDREN: {
      VIEW: 'view',
      APPROVE: 'approve',
      REJECT: 'reject',
    },
  },
  CORPORATE_ADMIN: {
    PARAM_NAME: 'corporate-admin',
    CHILDREN: {
      VIEW: 'view',
      DELETE_INVITATION: 'delete-invitation',
      DELETE: 'delete',
      REMOVE_ADMIN: 'remove-admin',
      UPDATE_INVITATION: 'update-invitation',
      CANCEL_INVITATION: 'cancel-invitation',
      CREATE_VENDOR_ACCOUNT: 'create-vendor-account',
      CREATE_RECIPIENT: 'create-recipient',
      CREATE_DASHPRO: 'create-dashpro',
    },
  },
  BROWSE_CARDS: {
    ROOT: 'browse-cards-modal',
  },
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
    INDIVIDUAL: {
      ROOT: 'individual-purchase-modal',
      CREATE: 'create-individual-purchase',
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
    VIEW: 'view-branch',
  },
  VENDOR_ACCOUNT: {
    ROOT: 'vendor-account-modal',
    CREATE: 'create-vendor-account',
  },
  EXPERIENCE: {
    ROOT: 'experience-modal',
    CREATE: 'create-experience',
    VIEW: 'view-experience',
    EDIT: 'edit-experience',
    DELETE: 'delete-experience',
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
  BULK_EMPLOYEE_PURCHASE: {
    ROOT: 'bulk-employee-purchase-modal',
    PARAM_NAME: 'bulk_employee_purchase',
    CHILDREN: {
      CREATE: 'create',
    },
  },
  NOTIFICATIONS: {
    ROOT: 'notifications-modal',
    PAYMENT_CHANGE: 'payment-change-notification',
  },
  LOGOUT: {
    ROOT: 'logout-modal',
    CONFIRM: 'confirm-logout',
  },
  INVITE_ADMIN: {
    ROOT: 'invite-admin-modal',
    CREATE: 'invite-admin',
  },
  VENDOR_PAYMENT_MANAGEMENT: {
    PARAM_NAME: 'vendor-payment-management',
    CHILDREN: {
      VIEW: 'view',
      PROCESS: 'process',
      PREFERENCES: 'preferences',
      PROFILE: 'profile',
    },
  },
}
