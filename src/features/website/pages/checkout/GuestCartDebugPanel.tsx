import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { getGuestCart, getGuestCartItems } from '@/features/website/services/cards'
import { useAuthStore } from '@/stores'

/** Dev-only: add ?debugGuestCart=1 on /checkout while logged in as guest to inspect API responses. */
export function GuestCartDebugPanel() {
  const [searchParams] = useSearchParams()
  const isGuestAuth = useAuthStore((s) => s.isGuestAuth)
  const isSessionReady = useAuthStore((s) => s.isSessionReady)
  const debugEnabled = searchParams.has('debugGuestCart')
  const enabled = import.meta.env.DEV && debugEnabled && isGuestAuth && isSessionReady

  const cartQuery = useQuery({
    queryKey: ['debug', 'guest-cart'],
    queryFn: () => getGuestCart(),
    enabled,
  })

  const itemsQuery = useQuery({
    queryKey: ['debug', 'guest-cart-items'],
    queryFn: () => getGuestCartItems(),
    enabled,
  })

  if (!enabled) return null

  return (
    <aside
      className="fixed bottom-4 right-4 z-[200] max-h-[50vh] w-[min(420px,90vw)] overflow-auto rounded-lg border border-amber-400 bg-amber-50 p-3 text-xs text-gray-900 shadow-lg"
      aria-label="Guest cart debug"
    >
      <p className="mb-2 font-semibold text-amber-900">Guest cart API (dev)</p>
      <p className="mb-1 font-medium">GET /guest-carts</p>
      <pre className="mb-3 whitespace-pre-wrap break-all">
        {cartQuery.isLoading
          ? 'Loading…'
          : cartQuery.isError
            ? JSON.stringify(cartQuery.error, null, 2)
            : JSON.stringify(cartQuery.data ?? null, null, 2)}
      </pre>
      <p className="mb-1 font-medium">GET /guest-carts/items</p>
      <pre className="whitespace-pre-wrap break-all">
        {itemsQuery.isLoading
          ? 'Loading…'
          : itemsQuery.isError
            ? JSON.stringify(itemsQuery.error, null, 2)
            : JSON.stringify(itemsQuery.data ?? [], null, 2)}
      </pre>
    </aside>
  )
}
