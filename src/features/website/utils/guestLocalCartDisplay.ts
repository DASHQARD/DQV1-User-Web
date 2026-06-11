import type { FlattenedCartItem } from '@/types'
import type { CartListResponse } from '@/types/responses'
import type { LocalGuestCartLine, LocalRecipientDraft } from '@/features/website/utils/guestLocalCartTypes'
import { formatPersonName } from '@/utils/personName'
import { filterShoppingCarts } from '@/features/website/utils/cartFilters'

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

/** Map persisted local lines to guest-carts-shaped item rows for bag UI. */
export function localLinesToCartItemRows(lines: LocalGuestCartLine[]) {
  return lines.map((line) => ({
    cart_item_id: line.lineId,
    card_id: line.card_id,
    product: line.product,
    type: line.type || line.lineKind || 'dashx',
    total_quantity: line.quantity,
    total_amount: String(line.price * line.quantity),
    images: [] as Array<{ file_url: string; file_name?: string }>,
  }))
}

/** Append unsynced local lines to an existing guest server cart for display. */
export function mergeGuestServerCartsWithLocalLines(
  serverCarts: CartListResponse[],
  localLines: LocalGuestCartLine[],
): CartListResponse[] {
  if (localLines.length === 0) return serverCarts

  const localItems = localLinesToCartItemRows(localLines)
  const localSubtotal = localLines.reduce((sum, line) => sum + line.price * line.quantity, 0)

  if (serverCarts.length === 0) {
    return [
      {
        cart_id: 'local',
        cart_status: 'active',
        total_amount: String(localSubtotal),
        items: localItems,
      } as unknown as CartListResponse,
    ]
  }

  return serverCarts.map((cart, index) => {
    if (index !== 0) return cart
    const existingItems = cart.items
      ? Array.isArray(cart.items)
        ? cart.items
        : [cart.items]
      : []
    const serverSubtotal = parseFloat(cart.total_amount || '0')
    return {
      ...cart,
      total_amount: String(serverSubtotal + localSubtotal),
      items: [...existingItems, ...localItems],
    } as unknown as CartListResponse
  })
}

/** Flatten server guest/member carts to per-unit display rows. */
export function flattenServerCartItems(carts: CartListResponse[]): FlattenedCartItem[] {
  const flattened: FlattenedCartItem[] = []
  filterShoppingCarts(carts).forEach((cart) => {
    if (!cart.items) return
    const itemsArray = Array.isArray(cart.items) ? cart.items : [cart.items]
    itemsArray.forEach((item: any) => {
      const qty = item.total_quantity || 1
      const totalItemAmount = parseFloat(item.total_amount || '0')
      const unitAmount = qty > 0 ? totalItemAmount / qty : totalItemAmount
      for (let i = 0; i < qty; i++) {
        flattened.push({
          cart_id: cart.cart_id,
          cart_status: cart.cart_status,
          card_id: item.card_id,
          product: item.product ?? '',
          vendor_name: undefined,
          type: item.type || 'dashx',
          currency: 'GHS',
          price: unitAmount.toString(),
          amount: unitAmount.toString(),
          images: item.images || [],
          cart_item_id: item.cart_item_id,
          total_quantity: qty,
          recipients: item.recipients || [],
          quantity_index: i,
        })
      }
    })
  })
  return flattened
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
