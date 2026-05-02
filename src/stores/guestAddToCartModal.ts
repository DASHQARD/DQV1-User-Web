import { create } from 'zustand'

export type GuestAddToCartPendingItem = {
  card_id?: string | number
  product?: string
  price?: number
  type?: string
  currency?: string
  /** Guest OTP + cart setup only; skip add-to-cart (e.g. custom DashPro/DashGo on DashQards). */
  authOnly?: boolean
  /** Gift card redemption: contact + OTP only; no cart (uses same guest-auth endpoints as checkout). */
  redemptionOnly?: boolean
}

type State = {
  isOpen: boolean
  pendingItem: GuestAddToCartPendingItem | null
  /** Called after successful guest OTP when `redemptionOnly` is true */
  redemptionOnSuccess: (() => void) | null
}

type Actions = {
  open: (item: GuestAddToCartPendingItem, redemptionOnSuccess?: () => void) => void
  close: () => void
}

const useGuestAddToCartModalStore = create<State & Actions>((set) => ({
  isOpen: false,
  pendingItem: null,
  redemptionOnSuccess: null,
  open: (item, redemptionOnSuccess) =>
    set({
      isOpen: true,
      pendingItem: item,
      redemptionOnSuccess: item.redemptionOnly ? (redemptionOnSuccess ?? null) : null,
    }),
  close: () => set({ isOpen: false, pendingItem: null, redemptionOnSuccess: null }),
}))

export { useGuestAddToCartModalStore }
