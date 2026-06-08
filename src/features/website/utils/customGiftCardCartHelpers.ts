/** Resolve cart_item_id after create + add-to-cart for custom DashPro / DashGo cards. */
export function findCartItemIdByCardId(
  cartItems: unknown,
  cardId: string | number,
): string | number | null {
  if (!Array.isArray(cartItems)) return null

  for (const cart of cartItems) {
    if (!cart?.items) continue
    const itemsArray = Array.isArray(cart.items) ? cart.items : [cart.items]
    const matchingItem = itemsArray.find(
      (item: { card_id?: string | number; gift_card_id?: string | number; cart_item_id?: string | number }) =>
        String(item.card_id) === String(cardId) ||
        String(item.gift_card_id) === String(cardId),
    )
    if (matchingItem?.cart_item_id != null) {
      return matchingItem.cart_item_id
    }
  }

  return null
}
