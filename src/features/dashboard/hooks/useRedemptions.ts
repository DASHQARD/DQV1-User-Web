import { useQuery } from '@tanstack/react-query'
import { getRedemptions } from '../services/redemptions'

export function useRedemptions() {
  return useQuery({
    queryKey: ['redemptions'],
    queryFn: getRedemptions,
  })
}
