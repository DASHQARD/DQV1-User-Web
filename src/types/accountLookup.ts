/** API envelope shared by account lookup endpoints */
export type AccountLookupEnvelope<T> = {
  status: 'success' | 'error' | string
  statusCode: number
  message: string
  data?: T
}

export type PaymentBank = {
  name: string
  code: string
}

export type PaymentBanksResponse = AccountLookupEnvelope<PaymentBank[]>

export type MobileMoneyProviderOption = {
  name?: string
  label?: string
  value?: string
  provider?: string
  code?: string
}

export type MobileMoneyProvidersResponse = AccountLookupEnvelope<
  MobileMoneyProviderOption[] | Record<string, string>
>

export type ResolveBankAccountPayload = {
  account_number: string
  bank_code: string
}

export type ResolveBankAccountData = {
  account_number: string
  account_name: string
  bank_code: string
}

export type ResolveBankAccountResponse = AccountLookupEnvelope<ResolveBankAccountData>

export type ResolveMobileMoneyAccountPayload = {
  phone_number: string
  provider: 'mtn' | 'vodafone' | 'airtel-tigo'
}

export type ResolveMobileMoneyAccountData = {
  /** Normalized local form (`0XX...`) from the API */
  phone_number: string
  account_name: string
  provider: string
  /** Internal provider code (e.g. `MTN`) — not needed in UI */
  bank_code?: string
}

export type ResolveMobileMoneyAccountResponse =
  AccountLookupEnvelope<ResolveMobileMoneyAccountData>

export type MobileMoneyLookupUiState = {
  accountName: string | null
  error: string | null
  isResolving: boolean
  isVerified: boolean
}

export type BankAccountLookupUiState = {
  accountName: string | null
  error: string | null
  isResolving: boolean
  isVerified: boolean
}
