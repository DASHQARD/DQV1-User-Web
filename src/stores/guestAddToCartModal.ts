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
  /** After OTP, sync localStorage guest cart to API (checkout flow). */
  checkoutSync?: boolean
  /** Standalone guest sign-in from navbar or login page (phone OTP only). */
  guestLoginOnly?: boolean
}

/** Contact already collected on checkout; modal opens at OTP only. */
export type GuestCheckoutOtpPrefill = {
  first_name: string
  last_name: string
  email: string
  phone: string
}

type State = {
  isOpen: boolean
  pendingItem: GuestAddToCartPendingItem | null
  checkoutOtpPrefill: GuestCheckoutOtpPrefill | null
  /** Called after successful guest OTP when `redemptionOnly` is true */
  redemptionOnSuccess: (() => void) | null
  /** Called after OTP + local cart sync when `checkoutSync` is true */
  checkoutOnSuccess: (() => void) | null
}

type Actions = {
  open: (
    item: GuestAddToCartPendingItem,
    onSuccess?: () => void,
    checkoutOtpPrefill?: GuestCheckoutOtpPrefill,
  ) => void
  close: () => void
}

const useGuestAddToCartModalStore = create<State & Actions>((set) => ({
  isOpen: false,
  pendingItem: null,
  checkoutOtpPrefill: null,
  redemptionOnSuccess: null,
  checkoutOnSuccess: null,
  open: (item, onSuccess, checkoutOtpPrefill) =>
    set({
      isOpen: true,
      pendingItem: item,
      checkoutOtpPrefill: item.checkoutSync ? (checkoutOtpPrefill ?? null) : null,
      redemptionOnSuccess: item.redemptionOnly ? (onSuccess ?? null) : null,
      checkoutOnSuccess: item.checkoutSync ? (onSuccess ?? null) : null,
    }),
  close: () =>
    set({
      isOpen: false,
      pendingItem: null,
      checkoutOtpPrefill: null,
      redemptionOnSuccess: null,
      checkoutOnSuccess: null,
    }),
}))

export { useGuestAddToCartModalStore }
