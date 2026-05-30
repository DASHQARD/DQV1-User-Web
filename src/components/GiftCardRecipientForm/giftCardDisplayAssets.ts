import DashProBG from '@/assets/svgs/dashpro_bg.svg'
import DashxBG from '@/assets/svgs/Dashx_bg.svg'
import DashPassBG from '@/assets/images/dashpass_bg.png'
import DashGoBG from '@/assets/svgs/dashgo_bg.svg'

export function getGiftCardBackground(cardType?: string): string {
  const normalizedType = cardType?.toLowerCase()
  switch (normalizedType) {
    case 'dashx':
      return DashxBG
    case 'dashpro':
      return DashProBG
    case 'dashpass':
      return DashPassBG
    case 'dashgo':
      return DashGoBG
    default:
      return DashProBG
  }
}

export function getGiftCardTypeName(cardType?: string): string {
  const normalizedType = cardType?.toLowerCase()
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
      return 'DASHPRO'
  }
}
