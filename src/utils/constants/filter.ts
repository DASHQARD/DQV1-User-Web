export const OPTIONS = {
  ADMIN_STATUS: ['active', 'deactivated', 'pending'],
  AGENT_STATUS: ['active', 'deactivated', 'inactive'],
  AGENT_TIER: ['A1', 'A2', 'A3'],
  CUSTOMER_STATUS: ['active', 'deactivated', 'inactive', 'pending_registration'],

  TRANSACTION_STATUS: ['pending', 'processing', 'failed', 'successful', 'cancelled', 'rejected'],
  DATE_RANGE: ['daily', 'weekly', 'monthly', 'all time'],
  SAVINGS_STATUS: ['pending', 'ongoing', 'completed'],
  USER_TYPE: ['individual', 'agent', 'merchant'],
  TRANSACTION_TYPE: ['purchase', 'redemption'],
  REQUEST_TYPE: ['experience_approval', 'branch_creation'],
  REQUEST_STATUS: ['pending', 'approved', 'rejected'],
  CUSTOMER_TIER: ['1', '2', '3'],
  MERCHANT_TIER: ['M1', 'M2', 'M3'],
  ACCOUNT_TIER: ['1', '2', '3', 'A1', 'A2', 'A3', 'M1', 'M2', 'M3'],
}
