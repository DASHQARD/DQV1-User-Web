import { deleteMethod, getList, getMethod, postMethod, patchMethod } from '@/services/requests'
import type {
  AddToCartPayload,
  CartItemResponse,
  CartListResponse,
  GuestAddCardPayload,
  GuestAddCardResponse,
  GuestCartApiResponse,
} from '@/types/responses'

export const addToCart = async (data: AddToCartPayload): Promise<any> => {
  return await postMethod('/carts', data)
}

/** Add a card to a guest cart. Omit cart_id when adding the first item. */
export const addGuestCard = async (data: GuestAddCardPayload): Promise<GuestAddCardResponse> => {
  const res = await postMethod('/guest-carts/add-card', data)
  const body = res?.data ?? res
  return body as GuestAddCardResponse
}

export const createDashGoAndAssign = async (data: {
  vendor_id: number
  product: string
  description: string
  price: number
  currency: string
  images?: Array<{ file_url: string; file_name: string }>
  terms_and_conditions?: Array<{ file_url: string; file_name: string }>
  issue_date: string
  redemption_branches: Array<{ branch_id: number }>
}): Promise<any> => {
  return await postMethod('/carts/create-dashgo', data)
}

export const createDashProAndAssign = async (data: {
  recipient_ids: number[]
  product: string
  description: string
  price: number
  currency: string
  images?: Array<{ file_url: string; file_name: string }>
  terms_and_conditions?: Array<{ file_url: string; file_name: string }>
  issue_date: string
}): Promise<any> => {
  return await postMethod('/carts/create-dashpro-and-assign', data)
}

export const getCartItems = async (query?: Record<string, any>): Promise<CartListResponse[]> => {
  return await getList('/carts', query)
}

/** GET /guest-carts/items. Normalizes to CartListResponse[] for consistency with user cart. */
export const getGuestCartItems = async (
  query?: Record<string, any>,
): Promise<CartListResponse[]> => {
  const res = await getList<GuestCartApiResponse>('/guest-carts/items', query)
  const payload = (res as { data?: GuestCartApiResponse })?.data ?? res
  if (!payload?.cart || !Array.isArray(payload.items)) return []
  const { cart, items } = payload
  const normalized: CartListResponse = {
    cart_id: cart.id,
    cart_status: cart.status,
    cart_created_at: cart.created_at,
    cart_updated_at: cart.updated_at,
    item_count: String(items.length),
    total_amount: cart.total_amount,
    user_id: 0,
    items: items.map((row) => ({
      card_id: row.card?.id ?? row.cart_item?.card_id,
      cart_item_id: row.cart_item_id,
      product: row.card?.product ?? '',
      type: row.card?.type ?? 'dashx',
      total_amount: row.cart_item?.total_amount ?? row.card?.price ?? '0',
      total_quantity: row.cart_item?.total_quantity ?? 1,
      images: row.card?.images ?? [],
      recipients: row.recipients ?? [],
    })) as unknown as CartListResponse['items'],
  }
  return [normalized]
}

export const getCartItem = async (id: number): Promise<CartItemResponse> => {
  return await getMethod(`/carts/${id}`)
}

export const deleteCartItem = async (id: number): Promise<any> => {
  return await deleteMethod(`/carts/items/${id}`)
}

export const deleteCartItemRecipient = async (cart_item_id: number): Promise<any> => {
  return await deleteMethod(`/carts/items/${cart_item_id}`)
}

export const updateCartItem = async (data: {
  cart_item_id: number
  quantity: number
}): Promise<any> => {
  return await patchMethod('/carts/items', data)
}
