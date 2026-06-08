import { getList, postMethod } from '@/services/requests'
import type {
  PaymentBanksResponse,
  MobileMoneyProvidersResponse,
  ResolveBankAccountPayload,
  ResolveBankAccountResponse,
  ResolveMobileMoneyAccountPayload,
  ResolveMobileMoneyAccountResponse,
} from '@/types/accountLookup'

/** GET /payments/banks — GhIPSS sort codes for bank selectors */
export const getPaymentBanks = async (currency = 'GHS'): Promise<PaymentBanksResponse> => {
  return await getList<PaymentBanksResponse>('/payments/banks', { currency })
}

/** GET /payments/mobile-money-providers */
export const getMobileMoneyProviders = async (): Promise<MobileMoneyProvidersResponse> => {
  return await getList<MobileMoneyProvidersResponse>('/payments/mobile-money-providers')
}

/** POST /payments/bank-account/account-details */
export const resolveBankAccount = async (
  data: ResolveBankAccountPayload,
): Promise<ResolveBankAccountResponse> => {
  const res = await postMethod('/payments/bank-account/account-details', {
    account_number: data.account_number.replace(/\D/g, ''),
    bank_code: data.bank_code.trim(),
  })
  // axios interceptor already returns the API envelope body — keep it intact for parsers
  return res as unknown as ResolveBankAccountResponse
}

/** POST /payments/mobile-money/account-details */
export const resolveMobileMoneyAccount = async (
  data: ResolveMobileMoneyAccountPayload,
): Promise<ResolveMobileMoneyAccountResponse> => {
  const res = await postMethod('/payments/mobile-money/account-details', data)
  return res as unknown as ResolveMobileMoneyAccountResponse
}
