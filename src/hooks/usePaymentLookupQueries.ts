import { useQuery } from '@tanstack/react-query'
import { getMobileMoneyProviders, getPaymentBanks } from '@/services/accountLookup'
import { normalizeMobileMoneyProviderOptions } from '@/utils/accountLookupMappers'
import type { PaymentBank } from '@/types/accountLookup'
import { MOBILE_MONEY_PROVIDERS } from '@/utils/constants/payment'

function unwrapBanksList(payload: unknown): PaymentBank[] {
  if (!payload || typeof payload !== 'object') return []
  const layer = payload as { data?: PaymentBank[] | { data?: PaymentBank[] } }
  const inner = layer.data
  if (Array.isArray(inner)) return inner
  if (inner && typeof inner === 'object' && Array.isArray((inner as { data?: PaymentBank[] }).data)) {
    return (inner as { data: PaymentBank[] }).data
  }
  return []
}

function unwrapProvidersPayload(payload: unknown) {
  if (!payload || typeof payload !== 'object') return undefined
  const layer = payload as { data?: unknown }
  const inner = layer.data
  if (Array.isArray(inner) || (inner && typeof inner === 'object')) return inner
  return undefined
}

export function usePaymentBanksQuery(currency = 'GHS') {
  const query = useQuery({
    queryKey: ['payments', 'banks', currency],
    queryFn: () => getPaymentBanks(currency),
    staleTime: 1000 * 60 * 30,
  })

  const banks = unwrapBanksList(query.data)
  const bankOptions = banks.map((bank) => ({
    label: bank.name,
    value: bank.code,
    name: bank.name,
    code: bank.code,
  }))

  return {
    banks,
    bankOptions,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}

export function useMobileMoneyProvidersQuery() {
  const query = useQuery({
    queryKey: ['payments', 'mobile-money-providers'],
    queryFn: () => getMobileMoneyProviders(),
    staleTime: 1000 * 60 * 30,
  })

  const providerOptions = normalizeMobileMoneyProviderOptions(
    unwrapProvidersPayload(query.data) as Parameters<typeof normalizeMobileMoneyProviderOptions>[0],
  )

  return {
    providerOptions: query.isError ? [...MOBILE_MONEY_PROVIDERS] : providerOptions,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
