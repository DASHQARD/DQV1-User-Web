import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useAuthStore } from '@/stores'
import { clearGuestCheckoutAfterPurchase } from '@/features/website/utils/clearGuestCheckoutStorage'

/** Wipe guest checkout browser storage and end the guest session after a successful purchase. */
export function useClearGuestCheckoutAfterPurchase(enabled: boolean) {
  const queryClient = useQueryClient()
  const ran = useRef(false)

  useEffect(() => {
    if (!enabled || ran.current) return
    ran.current = true

    clearGuestCheckoutAfterPurchase()
    useAuthStore.getState().logout()

    void queryClient.invalidateQueries({ queryKey: ['cart-items'] })
    void queryClient.invalidateQueries({ queryKey: ['guest-cart'] })
    void queryClient.invalidateQueries({ queryKey: ['guest-cart-header'] })
    void queryClient.removeQueries({ queryKey: ['guest-cards'] })
  }, [enabled, queryClient])
}
