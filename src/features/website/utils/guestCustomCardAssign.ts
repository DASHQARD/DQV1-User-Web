import { assignGuestRecipient } from '@/features/website/services/cards'
import type { GuestAssignRecipientPayload } from '@/types/responses'

/** POST /guest-carts/recipients — assign_to_self only needs cart_item_id + amount. */
export async function assignGuestSelfRecipient(
  cartItemId: string | number,
  amount: number,
  message = '',
): Promise<void> {
  const payload: GuestAssignRecipientPayload = {
    cart_item_id: cartItemId,
    assign_to_self: true,
    amount,
    message,
  }
  await assignGuestRecipient(payload)
}

export async function assignGuestNamedRecipient(
  cartItemId: string | number,
  amount: number,
  options: {
    recipient_name: string
    recipient_phone?: string
    recipient_email?: string
    message?: string
  },
): Promise<void> {
  const payload: GuestAssignRecipientPayload = {
    cart_item_id: cartItemId,
    assign_to_self: false,
    amount,
    message: options.message ?? '',
    recipient_name: options.recipient_name,
    ...(options.recipient_phone ? { recipient_phone: options.recipient_phone } : {}),
    ...(options.recipient_email ? { recipient_email: options.recipient_email } : {}),
  }
  await assignGuestRecipient(payload)
}
