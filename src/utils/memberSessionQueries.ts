import type { QueryClient } from '@tanstack/react-query'

/** React Query keys for registered-member-only data (not guest session). */
export const MEMBER_SESSION_QUERY_ROOTS = [
  ['user-profile'],
  ['cart-items', 'user'],
] as const

export function cancelMemberSessionQueries(queryClient: QueryClient): void {
  for (const queryKey of MEMBER_SESSION_QUERY_ROOTS) {
    queryClient.cancelQueries({ queryKey })
    queryClient.removeQueries({ queryKey })
  }
}
