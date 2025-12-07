export type CartItemResponse = {
  cart_id: number
  amount: string
  cart_status: string
  user_id: number
  cart_created_at: string
  cart_updated_at: string
  card_id: number
  product: string
  description: string
  type: string
  price: string
  currency: string
  vendor_id: number
  vendor_name: string
  expiry_date: string
  rating: number
  recipient_count: string
  recipients: {
    id: number
    name: string
    email: string
    phone: string
    message: string
    created_at: string
  }[]
  images: {
    id: number
    file_url: string
    file_name: string
  }[]
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
  cart_id: number
  name?: string
  email?: string
  phone?: string
  message: string
  quantity: number
  amount: number
  assign_to_self?: boolean
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
