import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  consumeCheckoutCartId,
  removeOrArchiveCart,
} from '@/features/website/utils/cartLifecycle'

/** After payment redirect, soft-archive the checked-out member cart. */
export function useArchiveCheckoutCart(enabled: boolean) {
  const queryClient = useQueryClient()
  const ran = useRef(false)

  useEffect(() => {
    if (!enabled || ran.current) return
    ran.current = true

    const cartId = consumeCheckoutCartId()
    if (!cartId) return

    void removeOrArchiveCart(cartId, 'completed')
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      })
      .catch(() => {
        // Cart may already be archived or hidden from the API — safe to ignore.
      })
  }, [enabled, queryClient])
}
