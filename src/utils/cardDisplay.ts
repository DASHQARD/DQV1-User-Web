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

/** True when the value is a storage key that must be resolved via signed-url API. */
export function isCardStorageFileKey(fileUrl: string | undefined): boolean {
  if (!fileUrl?.trim()) return false
  const trimmed = fileUrl.trim()
  if (isAbsoluteMediaUrl(trimmed)) return false
  if (trimmed.startsWith('uploads/') || trimmed.startsWith('/uploads/')) return false
  return true
}

/**
 * Split card media into either a direct URL (absolute or legacy /uploads path)
 * or a storage key for presigned URL resolution.
 */
export function getCardMediaSource(fileUrl: string | undefined): {
  directUrl: string
  storageKey: string | null
} {
  if (!fileUrl?.trim()) return { directUrl: '', storageKey: null }
  const trimmed = fileUrl.trim()
  if (isAbsoluteMediaUrl(trimmed)) return { directUrl: trimmed, storageKey: null }
  if (trimmed.startsWith('uploads/') || trimmed.startsWith('/uploads/')) {
    return { directUrl: getImageUrl(trimmed), storageKey: null }
  }
  return { directUrl: '', storageKey: trimmed }
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
