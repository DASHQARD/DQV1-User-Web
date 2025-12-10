export type CartItemImage = {
  file_url: string
  file_name: string
}

export type CartItemResponse = {
  cart_id: number
  card_id: number
  product: string
  vendor_name?: string
  type: string
  currency: string
  price: string
  amount: string
  quantity?: number
  images?: CartItemImage[]
  cart_item_id?: number
  total_amount?: string
  total_quantity?: number
  cart_status?: string
  user_id?: number
  cart_created_at?: string
  cart_updated_at?: string
  item_count?: string
  // Legacy nested structure support
  items?: Array<{
    type: string
    images: CartItemImage[]
    card_id: number
    product: string
    cart_item_id: number
    total_amount: string
    total_quantity: number
  }>
}

export type CartListResponse = {
  status: string
  statusCode: number
  message: string
  data: CartItemResponse[]
  pagination: {
    limit: number
    hasNextPage: boolean
    next: string | null
  }
  url: string
}

export type AddToCartPayload = {
  card_id: number
  amount: number
  quantity: number
}

export type AssignRecipientPayload = {
  assign_to_self: boolean
  cart_item_id: number
  quantity: number
  amount: number
  message?: string
  name?: string
  email?: string
  phone?: string
}

export type RecipientResponse = {
  id: number
  cart_id: number
  name: string
  email: string
  phone: string
  message: string | null
  quantity: number
  amount: number
  status: string
  created_at: string
  updated_at: string
}

export type RecipientsListResponse = {
  status: string
  statusCode: number
  message: string
  data: RecipientResponse[]
}

export type CreateRecipientPayload = {
  name: string
  email: string
  phone: string
}

export type UpdateRecipientPayload = {
  id: number
  cart_id: number
  name: string
  email: string
  phone: string
  message: string
}

export type UpdateRecipientAmountPayload = {
  id: number
  cart_id: number
  amount: string
  name: string
  email: string
  phone: string
  message: string
}
