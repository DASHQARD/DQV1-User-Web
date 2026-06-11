import { create } from 'zustand'

export type GuestAddToCartPendingItem = {
  card_id?: string | number
  product?: string
  price?: number
  type?: string
  currency?: string
  /** DashGo local-cart metadata (vendor profile quick add). */
  vendor_id?: string
  vendor_name?: string
  description?: string
  redemption_branches?: Array<{ branch_id: string }>
  /** Guest session + cart setup only; skip add-to-cart (e.g. custom DashPro/DashGo on DashQards). */
  authOnly?: boolean
  /** Gift card redemption: contact + OTP only; no cart (uses same guest-auth endpoints as checkout). */
  redemptionOnly?: boolean
  /** Standalone guest sign-in from navbar or login page (phone OTP only). */
  guestLoginOnly?: boolean
  /** Phone OTP required before POST /guest-cards (custom DashPro / DashGo). */
  cardCreationOtp?: boolean
}

type State = {
  isOpen: boolean
  pendingItem: GuestAddToCartPendingItem | null
  /** Called after successful guest OTP when `redemptionOnly` is true */
  redemptionOnSuccess: (() => void) | null
}

type Actions = {
  open: (item: GuestAddToCartPendingItem, onSuccess?: () => void) => void
  close: () => void
}

const useGuestAddToCartModalStore = create<State & Actions>((set) => ({
  isOpen: false,
  pendingItem: null,
  redemptionOnSuccess: null,
  open: (item, onSuccess) =>
    set({
      isOpen: true,
      pendingItem: item,
      redemptionOnSuccess: item.redemptionOnly ? (onSuccess ?? null) : null,
    }),
  close: () =>
    set({
      isOpen: false,
      pendingItem: null,
      redemptionOnSuccess: null,
    }),
}))

export { useGuestAddToCartModalStore }
