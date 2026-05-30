/** Standard assign-recipient form field paths (AssignRecipientSchema). */
export const STANDARD_RECIPIENT_FIELDS = {
  firstName: 'first_name',
  lastName: 'last_name',
  phone: 'phone',
  email: 'email',
  message: 'message',
  amount: 'amount',
  assignToSelf: 'assign_to_self',
} as const

/** DashGo purchase form field paths (DashGoAssignRecipientSchema). */
export const DASHGO_RECIPIENT_FIELDS = {
  firstName: 'recipient_first_name',
  lastName: 'recipient_last_name',
  phone: 'recipient_phone',
  email: 'recipient_email',
  message: 'recipient_message',
  amount: 'recipient_card_amount',
  assignToSelf: 'assign_to_self',
} as const

export type RecipientFieldNames = typeof STANDARD_RECIPIENT_FIELDS | typeof DASHGO_RECIPIENT_FIELDS
