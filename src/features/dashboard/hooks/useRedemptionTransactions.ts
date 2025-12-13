import { useQuery } from '@tanstack/react-query'
import { getRedemptionTransactions } from '../services/redemptionTransactions'

export function useRedemptionTransactions() {
  return useQuery({
    queryKey: ['redemption-transactions'],
    queryFn: getRedemptionTransactions,
  })
}
