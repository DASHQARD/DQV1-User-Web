import type { TierType } from '@/types'

export function getCustomerTierTagIconName(tier: TierType): IconNames {
  switch (tier) {
    case '1':
      return 'IndividualTierOne'
    case '2':
      return 'IndividualTierTwo'
    case '3':
      return 'IndividualTierThree'
    case 'M1':
      return 'MerchantTierOne'
    case 'M2':
      return 'MerchantTierTwo'
    case 'M3':
      return 'MerchantTierThree'
    case 'A1':
      return 'AgentTierOne'
    case 'A2':
      return 'AgentTierTwo'
    case 'A3':
      return 'AgentTierThree'
    default:
      return 'IndividualTierOne'
  }
}
