export type CartItemResponse = {
  id: number
  card_id: number
  amount: number
  quantity: number
  created_at: string
  updated_at: string
  card?: {
    id: number
    title: string
    subtitle?: string
    imageUrl?: string
    price?: number
    type?: string
  }
}

export type CartListResponse = {
  data: CartItemResponse[]
  total?: number
}

export type AddToCartPayload = {
  card_id: number
  amount: number
  quantity: number
}
