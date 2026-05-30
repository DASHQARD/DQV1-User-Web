import { syncGuestLocalCartToServer } from '@/features/website/utils/syncGuestLocalCartToServer'
import { GuestCartSyncError } from '@/features/website/utils/guestCartSyncError'
import { useGuestLocalCartStore, type GuestContactDraft } from '@/stores/guestLocalCart'

type SyncSetters = {
  getGuestCartId: () => number | null
  getGuestCartUuid?: () => string | null
  setGuestCartId: (id: number | null) => void
  setGuestCartUuid: (uuid: string | null) => void
}

export async function runGuestCheckoutBagSync(args: {
  contact: GuestContactDraft
  setters: SyncSetters
}): Promise<void> {
  const lines = useGuestLocalCartStore.getState().lines
  const setLastSyncError = useGuestLocalCartStore.getState().setLastSyncError
  const clearLocalGuestCart = useGuestLocalCartStore.getState().clear

  try {
    await syncGuestLocalCartToServer({
      lines,
      contact: args.contact,
      ...args.setters,
    })
    setLastSyncError(null)
    clearLocalGuestCart()
  } catch (error) {
    const message =
      error instanceof GuestCartSyncError
        ? error.failedLine
          ? `${error.failedLine.product}: ${error.message}`
          : error.message
        : error instanceof Error
          ? error.message
          : 'Could not add your gift cards to checkout.'
    setLastSyncError(message)
    throw error
  }
}
