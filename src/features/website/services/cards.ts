import { axiosClient } from '@/libs'
import { deleteMethod, getList, getMethod, postMethod, patchMethod } from '@/services/requests'
import type {
  AddToCartPayload,
  CartItemResponse,
  CartListResponse,
  GuestAddCardPayload,
  GuestAddCardResponse,
  GuestCartApiResponse,
  GuestAssignRecipientPayload,
  GuestUpdateCartItemPayload,
  GuestDeleteCartItemParams,
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

export const createGuestCart = async (data: {
  guest_name: string
  guest_email: string
}): Promise<GuestAddCardResponse> => {
  const res = await postMethod('/guest-carts', data)
  const body = res?.data ?? res
  return body as GuestAddCardResponse
}

/** GET /guest-carts — pending cart for the authenticated guest (optional cart_id). */
export const getGuestCart = async (query?: {
  cart_id?: number
}): Promise<GuestCartApiResponse | null> => {
  const res = await getList<GuestCartApiResponse | { data?: GuestCartApiResponse }>(
    '/guest-carts',
    query,
  )
  const payload = (res as { data?: GuestCartApiResponse })?.data ?? res
  if (!payload || typeof payload !== 'object') return null
  return payload as GuestCartApiResponse
}

function resolveGuestCartId(payload: GuestCartApiResponse | GuestAddCardResponse | null): number | undefined {
  if (!payload) return undefined
  const cart = (payload as GuestCartApiResponse).cart ?? (payload as { cart?: { id?: number } }).cart
  const id =
    cart?.id ??
    (payload as GuestAddCardResponse).cart_id ??
    (payload as { data?: { cart_id?: number } }).data?.cart_id
  return typeof id === 'number' ? id : undefined
}

/** Create guest cart if needed, then POST /guest-carts/add-card (never /carts). */
export async function ensureGuestCartAndAddCard(args: {
  card_id: string
  guest_name: string
  guest_email: string
  getGuestCartId: () => number | null
  setGuestCartId: (id: number | null) => void
}): Promise<GuestAddCardResponse> {
  const { card_id, guest_name, guest_email, getGuestCartId, setGuestCartId } = args
  let cartId = getGuestCartId() ?? undefined
  if (cartId === undefined) {
    const existingCart = await getGuestCart()
    const existingCartId = resolveGuestCartId(existingCart)
    if (typeof existingCartId === 'number') {
      setGuestCartId(existingCartId)
      cartId = existingCartId
    }
  }
  if (cartId === undefined) {
    const createCartResult = await createGuestCart({
      guest_name,
      guest_email,
    })
    const createdCartId = resolveGuestCartId(createCartResult)
    if (typeof createdCartId === 'number') {
      setGuestCartId(createdCartId)
      cartId = createdCartId
    }
  }

  const addResult = await addGuestCard({
    guest_name,
    guest_email,
    card_id,
    quantity: 1,
    ...(cartId !== undefined && { cart_id: cartId }),
  })
  const nextCartId =
    addResult?.cart_id ?? (addResult as { data?: { cart_id?: number } })?.data?.cart_id
  if (typeof nextCartId === 'number') {
    setGuestCartId(nextCartId)
  }
  return addResult
}

export const createDashGoAndAssign = async (data: {
  vendor_id: string
  product: string
  description: string
  price: number
  currency: string
  images?: Array<{ file_url: string; file_name: string }>
  terms_and_conditions?: Array<{ file_url: string; file_name: string }>
  issue_date: string
  redemption_branches: Array<{ branch_id: string }>
}): Promise<any> => {
  return await postMethod('/carts/create-dashgo', data)
}

export const createGuestDashGo = async (data: {
  guest_phone: string
  guest_name: string
  guest_email: string
  vendor_id: string
  product: string
  description: string
  price: number
  currency: string
  images?: Array<{ file_url: string; file_name: string }>
  terms_and_conditions?: Array<{ file_url: string; file_name: string }>
  issue_date: string
  redemption_branches: Array<{ branch_id: string }>
}): Promise<any> => {
  return await postMethod('/guest-cards/dash-go', data)
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

export const createGuestDashPro = async (data: {
  guest_name: string
  guest_email: string
  product: string
  description: string
  price: number
  currency: string
  images?: Array<{ file_url: string; file_name: string }>
  terms_and_conditions?: Array<{ file_url: string; file_name: string }>
  issue_date: string
  country_code: string
}): Promise<any> => {
  return await postMethod('/guest-cards/dash-pro', data)
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

export const getCartItem = async (id: string | number): Promise<CartItemResponse> => {
  return await getMethod(`/carts/${id}`)
}

export const deleteCartItem = async (id: string | number): Promise<any> => {
  return await deleteMethod(`/carts/items/${id}`)
}

export const deleteCartItemRecipient = async (cart_item_id: string | number): Promise<any> => {
  return await deleteMethod(`/carts/items/${cart_item_id}`)
}

export const updateCartItem = async (data: {
  cart_item_id: string | number
  quantity: number
}): Promise<any> => {
  return await patchMethod('/carts/items', data)
}

/** PATCH /guest-carts/items — update quantity of a guest cart item */
export const updateGuestCartItem = async (data: GuestUpdateCartItemPayload): Promise<any> => {
  return await patchMethod('/guest-carts/items', data)
}

/** DELETE /guest-carts/items — remove an item from the guest cart (query params) */
export const deleteGuestCartItem = async (params: GuestDeleteCartItemParams): Promise<any> => {
  const res = await axiosClient.delete('/guest-carts/items', {
    params: { cart_item_id: params.cart_item_id },
  })
  return res
}

/** POST /guest-carts/recipients — assign a recipient to a guest cart item */
export const assignGuestRecipient = async (
  data: GuestAssignRecipientPayload,
): Promise<{ status: string; message: string }> => {
  const res = await postMethod('/guest-carts/recipients', data)
  return res as unknown as { status: string; message: string }
}
