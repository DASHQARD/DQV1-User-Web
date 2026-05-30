import { useGuestLocalCartStore } from '@/stores/guestLocalCart'

/** True while local-only bag lines still need OTP + server sync before guest cart APIs. */
export function useGuestBagNotReady(): boolean {
  return useGuestLocalCartStore((s) => s.lines.length > 0)
}
