import { useQuery } from '@tanstack/react-query'
import { getCorporate } from '../services'

export function useCorporate() {
  return useQuery({
    queryKey: ['corporate'],
    queryFn: getCorporate,
    enabled: false,
  })
}
