import { ENV_VARS } from '@/utils/constants'
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
  return `${baseUrl}/uploads/${fileUrl}`
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
