/** Card product type (lowercase, used in routes and UI) */
export type CardType = 'dashx' | 'dashgo' | 'dashpro' | 'dashpass'

/** API card type (PascalCase, sent to backend) */
export type CardTypeAPI = 'DashGo' | 'DashPro' | 'DashX' | 'DashPass'

export const CARD_TYPE_MAP: Record<string, CardType> = {
  dashx: 'dashx',
  dashgo: 'dashgo',
  dashpro: 'dashpro',
  dashpass: 'dashpass',
}

export const CARD_DISPLAY_NAMES: Record<CardType, string> = {
  dashx: 'DashX',
  dashgo: 'DashGo',
  dashpro: 'DashPro',
  dashpass: 'DashPass',
}

/** Normalize route/param to valid CardType or undefined */
export function getValidCardType(cardType: string | undefined): CardType | undefined {
  const normalized = cardType?.toLowerCase()
  return normalized && CARD_TYPE_MAP[normalized] ? CARD_TYPE_MAP[normalized] : undefined
}

/** Convert card type to API format (DashGo, DashPro, etc.) */
export function formatCardTypeForAPI(cardType: string): CardTypeAPI | undefined {
  const normalized = cardType?.toLowerCase()
  if (normalized === 'dashgo') return 'DashGo'
  if (normalized === 'dashpro') return 'DashPro'
  if (normalized === 'dashx') return 'DashX'
  if (normalized === 'dashpass') return 'DashPass'
  return undefined
}
