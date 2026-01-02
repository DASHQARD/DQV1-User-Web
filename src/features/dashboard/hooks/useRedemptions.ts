import { useRedemptionQueries } from './useRedemptionQueries'

export function useRedemptions(params?: { limit?: number; after?: string; status?: string }) {
  const redemptionQueries = useRedemptionQueries()
  return redemptionQueries.useGetRedemptionsService(params)
}
