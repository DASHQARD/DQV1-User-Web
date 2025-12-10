export type CheckoutPayload = {
  cart_id: number
  full_name: string
  email: string
  phone_number: string
  amount_due: number
  user_id: number
}

export type CheckoutResponse = {
  status: string
  statusCode: number
  message: string
  data: string // Paystack checkout URL
  url: string
}
