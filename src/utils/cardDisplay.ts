import { ENV_VARS } from '@/utils/constants'
import { isAbsoluteMediaUrl } from '@/utils/resolveSignedUrl'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import DashpassBg from '@/assets/images/dashpass_bg.png'
import DashgoBg from '@/assets/svgs/dashgo_bg.svg'

export function getCardBackground(type: string | undefined): string {
  const normalizedType = type?.toLowerCase()?.trim()
  switch (normalizedType) {
    case 'dashx':
      return DashxBg
    case 'dashpro':
      return DashproBg
    case 'dashpass':
      return DashpassBg
    case 'dashgo':
      return DashgoBg
    default:
      return DashxBg
  }
}

/** True when the value is a bare storage key (not an absolute or uploads path). */
export function isCardStorageFileKey(fileUrl: string | undefined): boolean {
  if (!fileUrl?.trim()) return false
  const trimmed = fileUrl.trim()
  if (isAbsoluteMediaUrl(trimmed)) return false
  if (trimmed.startsWith('uploads/') || trimmed.startsWith('/uploads/')) return false
  return true
}

/**
 * Split card media into a direct browser URL (absolute, legacy uploads path, or storage key).
 */
export function getCardMediaSource(fileUrl: string | undefined): {
  directUrl: string
  storageKey: string | null
} {
  if (!fileUrl?.trim()) return { directUrl: '', storageKey: null }
  const trimmed = fileUrl.trim()
  if (isAbsoluteMediaUrl(trimmed)) return { directUrl: trimmed, storageKey: null }
  return { directUrl: getImageUrl(trimmed), storageKey: null }
}

/** Resolve absolute URLs, uploads paths, and storage keys to a browser-loadable URL. */
export function resolveMediaUrl(fileUrl: string | null | undefined): string | null {
  if (!fileUrl?.trim()) return null
  const trimmed = fileUrl.trim()
  if (isAbsoluteMediaUrl(trimmed)) return trimmed
  return getImageUrl(trimmed) || null
}

export function getImageUrl(fileUrl: string | undefined): string {
  if (!fileUrl) return ''
  if (
    fileUrl.startsWith('http://') ||
    fileUrl.startsWith('https://') ||
    fileUrl.startsWith('data:')
  ) {
    return fileUrl
  }
  let baseUrl = ENV_VARS.API_BASE_URL
  if (baseUrl.endsWith('/api/v1')) baseUrl = baseUrl.replace('/api/v1', '')
  const path = fileUrl.replace(/^\/?uploads\//, '')
  return `${baseUrl}/uploads/${path}`
}

/** Same resolution as images — terms PDFs and other card files use uploads or absolute URLs. */
export const getCardFileUrl = getImageUrl

export function isPdfFile(fileUrl?: string, fileName?: string): boolean {
  const name = (fileName ?? fileUrl ?? '').toLowerCase()
  return name.endsWith('.pdf') || (fileUrl ?? '').toLowerCase().includes('.pdf')
}

export function getCardTypeName(type: string | undefined): string {
  if (!type?.trim()) return 'DASHQARD'
  const normalizedType = type.toLowerCase().trim()
  switch (normalizedType) {
    case 'dashx':
      return 'DASHX'
    case 'dashpro':
      return 'DASHPRO'
    case 'dashpass':
      return 'DASHPASS'
    case 'dashgo':
      return 'DASHGO'
    default:
      return type.toUpperCase().trim()
  }
}

/** Issued card codes (e.g. X-9688-…, P-9688-…, G-9688-…) are not shown as product titles. */
export function isIssuedCardDisplayCode(value: string | null | undefined): boolean {
  if (!value?.trim()) return false
  return /^[XPG]-\d/i.test(value.trim())
}

/** Catalog/reference IDs and other non-human product strings (e.g. GHA-482761934-2). */
export function isInternalProductCode(value: string | null | undefined): boolean {
  if (!value?.trim()) return false
  const t = value.trim()
  if (isIssuedCardDisplayCode(t)) return true
  if (/\s/.test(t)) return false
  if (/^[A-Z]{2,6}-[\dA-Z-]+$/i.test(t) && (t.match(/\d/g)?.length ?? 0) >= 4) return true
  return false
}

/** Pull a readable title from marketing copy when `product` is an internal code. */
export function titleFromDescription(description: string | null | undefined): string {
  if (!description?.trim()) return ''
  const text = description.trim()

  const namedCard = text.match(/\bthe\s+([A-Z][^.!?—–\n]+?\s+Card)\b/i)
  if (namedCard?.[1]) return formatCardDisplayTitle(namedCard[1])

  const giftCard = text.match(/\b([A-Z][^.!?—–\n]{2,60}?\s+Gift\s+Card)\b/)
  if (giftCard?.[1]) return formatCardDisplayTitle(giftCard[1])

  const firstSentence = text.split(/[.!?](?:\s|$)/)[0]?.trim() ?? text
  const snippet =
    firstSentence.length > 72 ? `${firstSentence.slice(0, 69).trim()}…` : firstSentence
  return formatCardDisplayTitle(snippet)
}

function capitalizeWordPart(part: string): string {
  if (!part) return part
  if (/^\d+$/.test(part)) return part
  if (/[0-9]/.test(part)) return part
  if (/^[A-Z0-9]{2,}$/.test(part)) return part
  if (/[a-z]/.test(part) && /[A-Z]/.test(part)) return part
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
}

/** Title-case card names for display while preserving acronyms and numeric segments. */
export function formatCardDisplayTitle(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  return trimmed
    .split(/\s+/)
    .map((token) => {
      const leading = token.match(/^[^A-Za-z0-9]*/)?.[0] ?? ''
      const trailing = token.match(/[^A-Za-z0-9]*$/)?.[0] ?? ''
      const core = token.slice(leading.length, token.length - trailing.length)
      if (!core) return token

      if (/^dash[a-z]+$/i.test(core)) {
        return `${leading}${getCardTypeName(core)}${trailing}`
      }

      const coreFormatted = core
        .split('-')
        .map((segment) => capitalizeWordPart(segment))
        .join('-')

      return `${leading}${coreFormatted}${trailing}`
    })
    .join(' ')
}

export type CardDisplayNameOptions = {
  description?: string | null
  type?: string | null
}

export function getCardDisplayName(
  product?: string | null,
  cardName?: string | null,
  options?: CardDisplayNameOptions,
): string {
  for (const candidate of [product, cardName]) {
    const text = String(candidate ?? '').trim()
    if (text && !isInternalProductCode(text)) {
      return formatCardDisplayTitle(text)
    }
  }

  const fromDescription = titleFromDescription(options?.description)
  if (fromDescription) return fromDescription

  const typeLabel = getCardTypeName(options?.type ?? undefined)
  if (typeLabel && typeLabel !== 'DASHQARD') return `${typeLabel} Gift Card`
  return 'Gift Card'
}
