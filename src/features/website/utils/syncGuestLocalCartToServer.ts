import {
  assignGuestRecipient,
  createGuestDashGo,
  createGuestDashPro,
  ensureGuestCartAndAddCard,
  extractGiftCardIdFromGuestCreate,
  extractGuestCreateCartMeta,
  getGuestCartItems,
} from '@/features/website/services/cards'
import type { GuestContactDraft } from '@/stores/guestLocalCart'
import type { LocalGuestCartLine, LocalRecipientDraft } from '@/features/website/utils/guestLocalCartTypes'

function isCatalogLocalLine(line: LocalGuestCartLine): boolean {
  return !line.lineKind || line.lineKind === 'catalog'
}
import { formatPersonName } from '@/utils/personName'
import { pickGuestCartIdentityFields } from '@/utils/guestContact'
import { toGuestCartSyncError } from '@/features/website/utils/guestCartSyncError'
import { ensureGuestSession } from '@/features/website/services/guestSession'
import { assertGuestCartAmountWithinLimit } from '@/features/website/utils/validateGuestLocalCart'

function lineProductLabel(line: LocalGuestCartLine): string {
  if (line.lineKind === 'dashpro') return 'DashPro'
  if (line.lineKind === 'dashgo') return line.product || 'DashGo'
  return line.product || `Card #${line.card_id}`
}

function resolveCartItemIdForCard(
  cartItems: Awaited<ReturnType<typeof getGuestCartItems>>,
  cardId: string,
): string | number | null {
  if (!Array.isArray(cartItems)) return null
  for (const cart of cartItems) {
    if (!cart.items) continue
    const itemsArray = Array.isArray(cart.items) ? cart.items : [cart.items]
    const match = itemsArray.find(
      (item: { card_id?: string | number }) => String(item.card_id) === String(cardId),
    )
    if (match?.cart_item_id != null) return match.cart_item_id
  }
  return null
}

async function assignDraftsToCartItem(
  cartItemId: string | number,
  drafts: LocalRecipientDraft[],
): Promise<void> {
  for (const draft of drafts) {
    const recipientName = draft.assign_to_self
      ? undefined
      : formatPersonName(draft.first_name ?? '', draft.last_name ?? '')

    if (!draft.assign_to_self && !recipientName?.trim()) {
      throw new Error('Recipient name is required when not assigning to yourself')
    }

    await assignGuestRecipient({
      cart_item_id: cartItemId,
      assign_to_self: draft.assign_to_self,
      amount: draft.amount,
      message: draft.message,
      quantity: 1,
      ...(!draft.assign_to_self && recipientName ? { recipient_name: recipientName } : {}),
      ...(!draft.assign_to_self && draft.phone?.trim()
        ? { recipient_phone: draft.phone.trim() }
        : {}),
      ...(!draft.assign_to_self && draft.email?.trim()
        ? { recipient_email: draft.email.trim() }
        : {}),
    })
  }
}

type SyncSetters = {
  getGuestCartId: () => number | null
  getGuestCartUuid?: () => string | null
  setGuestCartId: (id: number | null) => void
  setGuestCartUuid: (uuid: string | null) => void
}

async function syncCustomLineToServer(
  line: LocalGuestCartLine,
  identity: ReturnType<typeof pickGuestCartIdentityFields>,
  setters: SyncSetters,
): Promise<void> {
  const product = lineProductLabel(line)
  try {
  assertGuestCartAmountWithinLimit(line.price)
  const issueDate = new Date().toISOString().split('T')[0]
  let cardId: string | null = null
  let cartItemId: string | number | null = null

  if (line.lineKind === 'dashpro') {
    const createResponse = await createGuestDashPro({
      ...identity,
      product: 'DashPro',
      description: line.description || 'DashPro',
      price: line.price,
      currency: line.currency || 'GHS',
      issue_date: issueDate,
      images: [],
      terms_and_conditions: [],
      country_code: line.country_code || 'GH',
    })
    cardId = extractGiftCardIdFromGuestCreate(createResponse)
    const meta = extractGuestCreateCartMeta(createResponse)
    if (meta.cartId) setters.setGuestCartUuid(meta.cartId)
    cartItemId = meta.cartItemId ?? null
  } else if (line.lineKind === 'dashgo') {
    if (!line.vendor_id || !line.redemption_branches?.length) {
      throw new Error('DashGo card is missing vendor or branch details')
    }
    const createResponse = await createGuestDashGo({
      ...identity,
      vendor_id: line.vendor_id,
      product: line.product,
      description: line.description || line.product,
      price: line.price,
      currency: line.currency || 'GHS',
      issue_date: issueDate,
      redemption_branches: line.redemption_branches,
      images: [],
      terms_and_conditions: [],
    })
    cardId = extractGiftCardIdFromGuestCreate(createResponse)
    const meta = extractGuestCreateCartMeta(createResponse)
    if (meta.cartId) setters.setGuestCartUuid(meta.cartId)
    cartItemId = meta.cartItemId ?? null
  } else {
    return
  }

  if (!cardId) {
    throw new Error(`Failed to create ${line.lineKind} card`)
  }

  if (cartItemId == null) {
    await ensureGuestCartAndAddCard({
      card_id: cardId,
      amount: line.price,
      ...identity,
      quantity: line.quantity,
      getGuestCartId: setters.getGuestCartId,
      getGuestCartUuid: setters.getGuestCartUuid,
      setGuestCartId: setters.setGuestCartId,
      setGuestCartUuid: setters.setGuestCartUuid,
    })
    const cartItems = await getGuestCartItems()
    cartItemId = resolveCartItemIdForCard(cartItems, cardId)
  }

  if (cartItemId == null) {
    throw new Error(`Could not add ${line.lineKind} card to cart`)
  }

  if (line.recipientDrafts.length > 0) {
    await assignDraftsToCartItem(cartItemId, line.recipientDrafts)
  }
  } catch (error) {
    throw toGuestCartSyncError(error, { lineId: line.lineId, product })
  }
}

export async function syncGuestLocalCartToServer(args: {
  lines: LocalGuestCartLine[]
  contact: GuestContactDraft
  getGuestCartId: () => number | null
  getGuestCartUuid?: () => string | null
  setGuestCartId: (id: number | null) => void
  setGuestCartUuid: (uuid: string | null) => void
}): Promise<void> {
  const guestName =
    args.contact.full_name?.trim() ||
    formatPersonName(args.contact.first_name ?? '', args.contact.last_name ?? '')
  const identity = pickGuestCartIdentityFields(guestName, args.contact.email)
  const setters: SyncSetters = {
    getGuestCartId: args.getGuestCartId,
    getGuestCartUuid: args.getGuestCartUuid,
    setGuestCartId: args.setGuestCartId,
    setGuestCartUuid: args.setGuestCartUuid,
  }

  const catalogLines = args.lines.filter(isCatalogLocalLine)
  const customLines = args.lines.filter((l) => l.lineKind === 'dashpro' || l.lineKind === 'dashgo')

  await ensureGuestSession()

  for (const line of catalogLines) {
    try {
      await ensureGuestCartAndAddCard({
        card_id: line.card_id,
        amount: line.price,
        ...identity,
        quantity: line.quantity,
        getGuestCartId: args.getGuestCartId,
        getGuestCartUuid: args.getGuestCartUuid,
        setGuestCartId: args.setGuestCartId,
        setGuestCartUuid: args.setGuestCartUuid,
      })
    } catch (error) {
      throw toGuestCartSyncError(error, {
        lineId: line.lineId,
        product: lineProductLabel(line),
      })
    }
  }

  for (const line of customLines) {
    await syncCustomLineToServer(line, identity, setters)
  }

  const cartItems = await getGuestCartItems()

  for (const line of catalogLines) {
    const cartItemId = resolveCartItemIdForCard(cartItems, line.card_id)
    if (cartItemId == null) {
      throw new Error(`Could not find cart item for card ${line.card_id}`)
    }
    await assignDraftsToCartItem(cartItemId, line.recipientDrafts)
  }
}
