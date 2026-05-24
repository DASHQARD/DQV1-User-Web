export type CartRecipient = {
  recipient_id?: string | number
  id?: string | number
  email?: string
  phone?: string
  amount?: number
  quantity?: number
  message?: string
  name?: string
  recipient_name?: string
  [key: string]: unknown
}

export function getRecipientQuantity(recipient: CartRecipient): number {
  const q = Number(recipient.quantity ?? recipient.recipient_quantity)
  return Number.isFinite(q) && q > 0 ? Math.floor(q) : 1
}

/** Whether a flattened unit row (0-based) is covered by a recipient assignment. */
export function isCartUnitAssigned(recipients: CartRecipient[], quantityIndex: number): boolean {
  let slot = 0
  for (const recipient of recipients) {
    const span = getRecipientQuantity(recipient)
    if (quantityIndex >= slot && quantityIndex < slot + span) return true
    slot += span
  }
  return false
}

/** Recipients to show for one flattened unit row; respects recipient.quantity spans. */
export function getRecipientsForCartUnit(
  recipients: CartRecipient[],
  quantityIndex: number,
  unitAmount?: number,
): CartRecipient[] {
  let slot = 0
  for (const recipient of recipients) {
    const span = getRecipientQuantity(recipient)
    if (quantityIndex >= slot && quantityIndex < slot + span) {
      const qty = getRecipientQuantity(recipient)
      const rawAmount = Number(recipient.amount ?? recipient.recipient_amount)
      const perUnitAmount =
        unitAmount ??
        (Number.isFinite(rawAmount) && qty > 1 ? rawAmount / qty : rawAmount)

      return [
        {
          ...recipient,
          id: recipient.recipient_id ?? recipient.id,
          name: recipient.name ?? recipient.recipient_name ?? recipient.email,
          amount: perUnitAmount,
        },
      ]
    }
    slot += span
  }
  return []
}
