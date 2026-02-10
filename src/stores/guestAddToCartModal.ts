import { create } from 'zustand'

export type GuestAddToCartPendingItem = {
  card_id: number
  product: string
  price: number
  type?: string
  currency?: string
}

type State = {
  isOpen: boolean
  pendingItem: GuestAddToCartPendingItem | null
}

type Actions = {
  open: (item: GuestAddToCartPendingItem) => void
  close: () => void
}

const useGuestAddToCartModalStore = create<State & Actions>((set) => ({
  isOpen: false,
  pendingItem: null,
  open: (item) => set({ isOpen: true, pendingItem: item }),
  close: () => set({ isOpen: false, pendingItem: null }),
}))

export { useGuestAddToCartModalStore }
