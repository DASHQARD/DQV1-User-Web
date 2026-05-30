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
  GuestGetCartRecipientsParams,
  GuestUpdateRecipientPayload,
  GuestDeleteRecipientParams,
  GuestGetCardsParams,
  GuestGetCardSingleParams,
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
  guest_name?: string | null
  guest_email?: string | null
}): Promise<GuestAddCardResponse> => {
  const res = await postMethod('/guest-carts', data)
  const body = res?.data ?? res
  return body as GuestAddCardResponse
}

/** True when GET /guest-carts has no pending cart for this guest (expected before first POST). */
export function isGuestCartNotFoundError(error: unknown): boolean {
  const err = error as { status?: number; message?: string }
  if (err?.status === 404) return true
  const message = String(err?.message ?? '').toLowerCase()
  return message.includes('cart not found')
}

/** GET /guest-carts — pending cart for the authenticated guest (optional cart_id). */
export const getGuestCart = async (query?: {
  cart_id?: number | string
}): Promise<GuestCartApiResponse | null> => {
  try {
    const res = await getList<GuestCartApiResponse | { data?: GuestCartApiResponse }>(
      '/guest-carts',
      query,
    )
    const payload = (res as { data?: GuestCartApiResponse })?.data ?? res
    if (!payload || typeof payload !== 'object') return null
    return payload as GuestCartApiResponse
  } catch (error) {
    if (isGuestCartNotFoundError(error)) return null
    throw error
  }
}

export function resolveGuestCartNumericId(
  payload: GuestCartApiResponse | GuestAddCardResponse | null,
): number | undefined {
  if (!payload) return undefined
  const cart = (payload as GuestCartApiResponse).cart ?? (payload as { cart?: { id?: number | string } }).cart
  const raw =
    cart?.id ??
    (payload as GuestAddCardResponse).cart_id ??
    (payload as { data?: { cart_id?: number | string } }).data?.cart_id
  return typeof raw === 'number' ? raw : undefined
}

/** @deprecated Use resolveGuestCartNumericId */
export function resolveGuestCartId(
  payload: GuestCartApiResponse | GuestAddCardResponse | null,
): number | undefined {
  return resolveGuestCartNumericId(payload)
}

export function resolveGuestCartUuid(
  payload: GuestCartApiResponse | GuestAddCardResponse | null,
): string | undefined {
  if (!payload) return undefined
  const cart = (payload as GuestCartApiResponse).cart
  const explicitUuid =
    cart?.uuid ??
    (payload as GuestCartApiResponse).uuid ??
    (payload as { data?: { uuid?: string } }).data?.uuid
  if (typeof explicitUuid === 'string' && explicitUuid.trim()) {
    return explicitUuid.trim()
  }
  const rawId =
    cart?.id ??
    (payload as GuestAddCardResponse).cart_id ??
    (payload as { data?: { cart_id?: number | string } }).data?.cart_id
  if (typeof rawId === 'string' && rawId.trim()) {
    return rawId.trim()
  }
  return undefined
}

/** Cart reference for add-card / checkout: prefer UUID, else numeric id. */
export function resolveGuestCartRef(
  payload: GuestCartApiResponse | GuestAddCardResponse | null,
): string | number | undefined {
  return resolveGuestCartUuid(payload) ?? resolveGuestCartNumericId(payload)
}

function syncGuestCartIds(
  payload: GuestCartApiResponse | GuestAddCardResponse | null,
  setGuestCartId: (id: number | null) => void,
  setGuestCartUuid: (uuid: string | null) => void,
) {
  const numericId = resolveGuestCartNumericId(payload)
  if (typeof numericId === 'number') {
    setGuestCartId(numericId)
  }
  const uuid = resolveGuestCartUuid(payload)
  if (uuid) {
    setGuestCartUuid(uuid)
  }
}

/** Create guest cart if needed, then POST /guest-carts/add-card (never /carts). */
export async function ensureGuestCartAndAddCard(args: {
  card_id: string
  guest_name?: string | null
  guest_email?: string | null
  quantity?: number
  getGuestCartId: () => number | null
  getGuestCartUuid?: () => string | null
  setGuestCartId: (id: number | null) => void
  setGuestCartUuid: (uuid: string | null) => void
}): Promise<GuestAddCardResponse> {
  const {
    card_id,
    guest_name,
    guest_email,
    quantity = 1,
    getGuestCartId,
    getGuestCartUuid,
    setGuestCartId,
    setGuestCartUuid,
  } = args
  const identity = {
    ...(guest_name?.trim() ? { guest_name: guest_name.trim() } : {}),
    ...(guest_email?.trim() ? { guest_email: guest_email.trim() } : {}),
  }

  const storedUuid = getGuestCartUuid?.()?.trim()
  const storedNumeric = getGuestCartId()
  let cartRef: string | number | undefined =
    storedUuid || (storedNumeric != null ? storedNumeric : undefined)

  if (cartRef === undefined) {
    const existingCart = await getGuestCart()
    syncGuestCartIds(existingCart, setGuestCartId, setGuestCartUuid)
    cartRef = resolveGuestCartRef(existingCart)
  }

  if (cartRef === undefined) {
    const createCartResult = await createGuestCart(identity)
    syncGuestCartIds(createCartResult, setGuestCartId, setGuestCartUuid)
    cartRef = resolveGuestCartRef(createCartResult)
  }

  const addResult = await addGuestCard({
    ...identity,
    card_id,
    quantity: Math.max(1, quantity),
    ...(cartRef !== undefined && { cart_id: cartRef }),
  })
  syncGuestCartIds(addResult, setGuestCartId, setGuestCartUuid)
  return addResult
}

/** Unwrap axios + API envelope to the inner `data` payload (e.g. guest_card, gift_card, cart). */
export function unwrapPostResponsePayload(response: unknown): Record<string, unknown> | null {
  if (!response || typeof response !== 'object') return null
  const res = response as Record<string, unknown>
  let layer: Record<string, unknown> = (res.data as Record<string, unknown>) ?? res
  const nested = layer.data
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const inner = nested as Record<string, unknown>
    if (inner.guest_card != null || inner.gift_card != null || inner.cart != null || inner.card != null) {
      return inner
    }
  }
  return layer
}

/** Guest card row id from POST /guest-cards/dash-go or /guest-cards/dash-pro create responses. */
export function extractGuestCardRecordId(response: unknown): string | null {
  const payload = unwrapPostResponsePayload(response)
  if (!payload) return null
  const guestCard = payload.guest_card as Record<string, unknown> | undefined
  const raw = guestCard?.id ?? payload.guest_card_id
  if (raw == null || raw === '') return null
  return String(raw)
}

/** Gift card UUID from POST /guest-cards/dash-go or /guest-cards/dash-pro create responses. */
export function extractGiftCardIdFromGuestCreate(response: unknown): string | null {
  const payload = unwrapPostResponsePayload(response)
  if (!payload) return null
  const giftCard = payload.gift_card as Record<string, unknown> | undefined
  const guestCard = payload.guest_card as Record<string, unknown> | undefined
  const card = payload.card as Record<string, unknown> | undefined
  const raw =
    giftCard?.id ??
    guestCard?.gift_card_id ??
    card?.id ??
    payload.id ??
    payload.card_id
  if (raw == null || raw === '') return null
  return String(raw)
}

/** Cart refs when create endpoint already adds the card (guest-cards/dash-go). */
export function extractGuestCreateCartMeta(response: unknown): {
  cartId?: string
  cartItemId?: string
} {
  const payload = unwrapPostResponsePayload(response)
  const cart = payload?.cart as Record<string, unknown> | undefined
  if (!cart) return {}
  return {
    ...(cart.cart_id != null && { cartId: String(cart.cart_id) }),
    ...(cart.cart_item_id != null && { cartItemId: String(cart.cart_item_id) }),
  }
}

export type CustomDashGoGuestContact = {
  guest_name?: string | null
  guest_email?: string | null
}

/** Create custom DashGo and add to cart — guest uses /guest-cards/dash-go + guest-carts; members use /carts/create-dashgo. */
export async function createCustomDashGoAndAddToCart(options: {
  vendor_id: string
  vendorName: string
  price: number
  currency?: string
  redemption_branches: Array<{ branch_id: string }>
  isGuestAuth: boolean
  guestContact?: CustomDashGoGuestContact
  getGuestCartId: () => number | null
  getGuestCartUuid?: () => string | null
  setGuestCartId: (id: number | null) => void
  setGuestCartUuid: (uuid: string | null) => void
}): Promise<void> {
  const issueDate = new Date().toISOString().split('T')[0]
  const currency = options.currency ?? 'GHS'
  const product = 'DashGo Gift Card'
  const description = `Custom DashGo card for ${options.vendorName}`

  if (options.isGuestAuth) {
    const contact = options.guestContact
    const identity = {
      ...(contact?.guest_name?.trim() ? { guest_name: contact.guest_name.trim() } : {}),
      ...(contact?.guest_email?.trim() ? { guest_email: contact.guest_email.trim() } : {}),
    }
    const createResponse = await createGuestDashGo({
      ...identity,
      vendor_id: options.vendor_id,
      product,
      description,
      price: options.price,
      currency,
      issue_date: issueDate,
      redemption_branches: options.redemption_branches,
      images: [],
      terms_and_conditions: [],
    })
    const cardId = extractGiftCardIdFromGuestCreate(createResponse)
    if (!cardId) {
      throw new Error('Failed to create DashGo card')
    }
    const { cartId } = extractGuestCreateCartMeta(createResponse)
    if (cartId) {
      options.setGuestCartUuid(cartId)
      return
    }
    await ensureGuestCartAndAddCard({
      card_id: cardId,
      ...identity,
      getGuestCartId: options.getGuestCartId,
      getGuestCartUuid: options.getGuestCartUuid,
      setGuestCartId: options.setGuestCartId,
      setGuestCartUuid: options.setGuestCartUuid,
    })
    return
  }

  await createDashGoAndAssign({
    vendor_id: options.vendor_id,
    product,
    description,
    price: options.price,
    currency,
    issue_date: issueDate,
    redemption_branches: options.redemption_branches,
  })
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

/** Guest identity comes from the Bearer token; do not send guest_phone (rejected by API). */
export const createGuestDashGo = async (data: {
  guest_name?: string | null
  guest_email?: string | null
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
  guest_name?: string | null
  guest_email?: string | null
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
  try {
    const res = await getList<GuestCartApiResponse>('/guest-carts/items', query)
    const payload = (res as { data?: GuestCartApiResponse })?.data ?? res
    if (!payload?.cart || !Array.isArray(payload.items)) return []
    const { cart, items } = payload
    const cartUuid = resolveGuestCartUuid(payload)
    const normalized: CartListResponse = {
      cart_id: typeof cart.id === 'number' ? cart.id : 0,
      guest_cart_uuid: cartUuid,
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
  } catch (error) {
    if (isGuestCartNotFoundError(error)) return []
    throw error
  }
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

/** GET /guest-cards — list cards created by the authenticated guest */
export const getGuestCards = async (params?: GuestGetCardsParams): Promise<unknown> => {
  return await getList('/guest-cards', params)
}

/** GET /guest-cards/single — single guest card by guest_card_id */
export const getGuestCardSingle = async (params: GuestGetCardSingleParams): Promise<unknown> => {
  return await getList('/guest-cards/single', params)
}

/** GET /guest-carts/recipients — recipients for a guest cart item (identity from Bearer token) */
export const getGuestCartRecipients = async (
  params: GuestGetCartRecipientsParams,
): Promise<unknown[]> => {
  const res = await getList('/guest-carts/recipients', {
    cart_item_id: params.cart_item_id,
  })
  if (Array.isArray(res)) return res
  const data = (res as { data?: unknown })?.data
  return Array.isArray(data) ? data : []
}

/** PATCH /guest-carts/recipients — update a guest cart recipient */
export const updateGuestRecipient = async (
  data: GuestUpdateRecipientPayload,
): Promise<{ status: string; message: string }> => {
  const res = await patchMethod('/guest-carts/recipients', data)
  return res as unknown as { status: string; message: string }
}

/** DELETE /guest-carts/recipients — remove a guest cart recipient */
export const deleteGuestRecipient = async (params: GuestDeleteRecipientParams): Promise<void> => {
  await axiosClient.delete('/guest-carts/recipients', { params })
}

/** POST /guest-carts/recipients — assign a recipient to a guest cart item */
export const assignGuestRecipient = async (
  data: GuestAssignRecipientPayload,
): Promise<{ status: string; message: string }> => {
  const res = await postMethod('/guest-carts/recipients', data)
  return res as unknown as { status: string; message: string }
}
