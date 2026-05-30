import type { FlattenedCartItem } from '@/types'
import type { LocalGuestCartLine, LocalRecipientDraft } from '@/stores/guestLocalCart'
import { formatPersonName } from '@/utils/personName'

export function localRecipientToDisplayRow(draft: LocalRecipientDraft) {
  const name = draft.assign_to_self
    ? 'Self'
    : formatPersonName(draft.first_name ?? '', draft.last_name ?? '') || 'Recipient'
  return {
    draftId: draft.draftId,
    name,
    recipient_name: name,
    email: draft.email ?? '',
    recipient_email: draft.email ?? '',
    phone: draft.phone ?? '',
    recipient_phone: draft.phone ?? '',
    message: draft.message,
    amount: draft.amount,
    recipient_amount: draft.amount,
    assign_to_self: draft.assign_to_self,
    quantity_index: draft.quantity_index,
  }
}

/** Flatten local lines to checkout/bag rows (one row per quantity unit). */
export function flattenLocalGuestCartLines(lines: LocalGuestCartLine[]): FlattenedCartItem[] {
  const flattened: FlattenedCartItem[] = []
  for (const line of lines) {
    for (let i = 0; i < line.quantity; i++) {
      const draft = line.recipientDrafts.find((d) => d.quantity_index === i)
      const recipients = draft ? [localRecipientToDisplayRow(draft)] : []
      flattened.push({
        cart_id: 'local',
        card_id: line.card_id,
        product: line.product,
        vendor_name: undefined,
        type: line.type || line.lineKind || 'dashx',
        currency: line.currency,
        price: line.price.toString(),
        amount: line.price.toString(),
        images: [],
        cart_item_id: line.lineId,
        total_quantity: line.quantity,
        recipients,
        quantity_index: i,
      })
    }
  }
  return flattened
}
