import { patchMethod } from '@/services/requests'

export interface UpdatePaymentPreferencesPayload {
  payment_frequency?: 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'custom'
  auto_payout?: boolean
  minimum_payout_amount?: number
}

export const updatePaymentPreferences = async (
  data: UpdatePaymentPreferencesPayload,
): Promise<any> => {
  return await patchMethod('/payment-preferences', data)
}
