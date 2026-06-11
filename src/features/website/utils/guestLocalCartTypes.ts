/** Legacy local-bag line shapes — kept for tests and unused sync helpers. */

export type LocalRecipientDraft = {
  draftId: string
  quantity_index: number
  assign_to_self: boolean
  first_name?: string
  last_name?: string
  phone?: string
  email?: string
  message: string
  amount: number
}

export type LocalCartLineKind = 'catalog' | 'dashpro' | 'dashgo'

export type LocalGuestCartLine = {
  lineId: string
  lineKind?: LocalCartLineKind
  card_id: string
  product: string
  price: number
  currency: string
  type?: string
  quantity: number
  recipientDrafts: LocalRecipientDraft[]
  vendor_id?: string
  redemption_branches?: Array<{ branch_id: string }>
  description?: string
  country_code?: string
}
