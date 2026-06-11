import { getImageUrl } from '@/utils/cardDisplay'

type RecipientAmountCardImages = {
  card_images?: Array<{ file_url?: string }> | null
  images?: Array<{ file_url?: string }> | null
}

/** Member APIs use `card_images`; guest APIs use `images`. */
export function resolveRecipientAmountCardImageUrl(
  card: RecipientAmountCardImages | null | undefined,
): string | undefined {
  if (!card) return undefined
  const list = card.card_images ?? card.images ?? []
  const fileUrl = list[0]?.file_url
  return fileUrl ? getImageUrl(fileUrl) : undefined
}

function extractRecipientAmountCards(payload: unknown): RecipientAmountCardImages[] {
  if (payload == null || typeof payload !== 'object') return []
  const root = payload as Record<string, unknown>
  const data =
    root.data != null && typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : root
  const cards = data.cards ?? root.cards
  if (!Array.isArray(cards)) return []
  return cards as RecipientAmountCardImages[]
}

/** First card image from a recipient-amount balance API response. */
export function resolveRecipientAmountPreviewImageUrl(payload: unknown): string | undefined {
  const cards = extractRecipientAmountCards(payload)
  for (const card of cards) {
    const url = resolveRecipientAmountCardImageUrl(card)
    if (url) return url
  }
  return resolveRecipientAmountCardImageUrl(
    payload as RecipientAmountCardImages | null | undefined,
  )
}
