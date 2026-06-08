import type {
  MobileMoneyProviderOption,
  ResolveMobileMoneyAccountData,
  ResolveMobileMoneyAccountResponse,
  ResolveBankAccountData,
  ResolveBankAccountResponse,
} from '@/types/accountLookup'
import { MOBILE_MONEY_PROVIDERS } from '@/utils/constants/payment'

export type UiMobileMoneyProvider = 'mtn' | 'vodafone' | 'airteltigo'

const API_PROVIDER_AIRTEL = 'airtel-tigo' as const

/** Map stored/UI provider values to lookup API `provider`. */
export function toLookupApiProvider(
  provider: string | null | undefined,
): 'mtn' | 'vodafone' | 'airtel-tigo' | null {
  const normalized = String(provider ?? '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
  if (!normalized) return null
  if (normalized === 'mtn') return 'mtn'
  if (normalized === 'vodafone' || normalized === 'telecel') return 'vodafone'
  if (normalized === 'airteltigo' || normalized === 'airtel-tigo' || normalized === 'airtel') {
    return API_PROVIDER_AIRTEL
  }
  return null
}

/** Map API provider echo back to UI/storage value. */
export function fromLookupApiProvider(provider: string | null | undefined): UiMobileMoneyProvider {
  const normalized = String(provider ?? '')
    .trim()
    .toLowerCase()
  if (normalized === 'vodafone' || normalized === 'telecel') return 'vodafone'
  if (normalized === 'airtel-tigo' || normalized === 'airteltigo' || normalized === 'airtel') {
    return 'airteltigo'
  }
  return 'mtn'
}

export function interpretMobileMoneyLookupResponse(
  response: ResolveMobileMoneyAccountResponse | ResolveMobileMoneyAccountData | undefined,
): {
  accountName: string | null
  error: string | null
  phoneNumber: string | null
  provider: string | null
  bankCode: string | null
} {
  const data = extractMobileMoneyLookupData(response)
  const accountName = data?.account_name?.trim() || ''
  if (accountName) {
    return {
      accountName,
      error: null,
      phoneNumber: data?.phone_number?.trim() || null,
      provider: data?.provider?.trim() || null,
      bankCode: data?.bank_code?.trim() || null,
    }
  }
  const envelopeMessage =
    response && 'message' in response && typeof response.message === 'string'
      ? response.message.trim()
      : ''
  return {
    accountName: null,
    error:
      envelopeMessage ||
      'Mobile money number could not be verified. Please check the details and try again.',
    phoneNumber: null,
    provider: null,
    bankCode: null,
  }
}

function extractMobileMoneyLookupData(
  response: ResolveMobileMoneyAccountResponse | ResolveMobileMoneyAccountData | undefined,
): ResolveMobileMoneyAccountData | undefined {
  if (!response || typeof response !== 'object') return undefined
  if ('account_name' in response && !('status' in response)) {
    return response as ResolveMobileMoneyAccountData
  }
  return unwrapLookupData<ResolveMobileMoneyAccountData>(
    response as ResolveMobileMoneyAccountResponse,
  )
}

export function interpretBankAccountLookupResponse(
  response: ResolveBankAccountResponse | undefined,
): { accountName: string | null; error: string | null } {
  const data = unwrapLookupData<ResolveBankAccountData>(response)
  const accountName = data?.account_name?.trim() || ''
  if (accountName) {
    return { accountName, error: null }
  }
  return {
    accountName: null,
    error:
      response?.message?.trim() ||
      'Bank account could not be verified. Please check the details and try again.',
  }
}

function unwrapLookupData<T>(response: { data?: T | { data?: T } } | undefined): T | undefined {
  if (!response?.data) return undefined
  const layer = response.data as T | { data?: T }
  if (layer && typeof layer === 'object' && 'data' in layer && layer.data) {
    return layer.data as T
  }
  return layer as T
}

/** Normalize GET /payments/mobile-money-providers to combobox options. */
export function normalizeMobileMoneyProviderOptions(
  payload: MobileMoneyProviderOption[] | Record<string, string> | undefined,
): Array<{ label: string; value: UiMobileMoneyProvider }> {
  if (!payload) return [...MOBILE_MONEY_PROVIDERS]

  if (Array.isArray(payload)) {
    const mapped = payload
      .map((row) => {
        const raw =
          row.provider ?? row.value ?? row.code ?? (typeof row.name === 'string' ? row.name : '')
        const value = fromLookupApiProvider(String(raw))
        const label =
          row.label ?? row.name ?? MOBILE_MONEY_PROVIDERS.find((p) => p.value === value)?.label ?? value
        return { label: String(label), value }
      })
      .filter((row) => row.label && row.value)
    return mapped.length > 0 ? mapped : [...MOBILE_MONEY_PROVIDERS]
  }

  const fromRecord = Object.entries(payload).map(([key, label]) => ({
    label: String(label),
    value: fromLookupApiProvider(key),
  }))
  return fromRecord.length > 0 ? fromRecord : [...MOBILE_MONEY_PROVIDERS]
}

/** Digits-only account number within API rules (8–20). */
export function isValidBankAccountNumberForLookup(accountNumber: string): boolean {
  const digits = accountNumber.replace(/\D/g, '')
  return digits.length >= 8 && digits.length <= 20
}
