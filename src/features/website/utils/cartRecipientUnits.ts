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

export function getCartRecipientDisplayLines(recipient: CartRecipient): {
  primary: string
  secondary?: string
} {
  const name = String(recipient.name ?? recipient.recipient_name ?? '').trim()
  const email = String(recipient.email ?? recipient.recipient_email ?? '').trim()
  const phone = String(recipient.phone ?? recipient.recipient_phone ?? '').trim()

  if (name && name !== email) {
    return {
      primary: name,
      secondary: email || phone || undefined,
    }
  }
  if (email) {
    return {
      primary: email,
      secondary: phone && phone !== email ? phone : undefined,
    }
  }
  if (phone) {
    return { primary: phone }
  }
  return { primary: 'Recipient' }
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

      const display = getCartRecipientDisplayLines(recipient)
      return [
        {
          ...recipient,
          id: recipient.recipient_id ?? recipient.id,
          name: display.primary,
          recipient_name: display.primary,
          amount: perUnitAmount,
        },
      ]
    }
    slot += span
  }
  return []
}
