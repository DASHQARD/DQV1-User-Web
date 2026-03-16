/** Checkout gateway names from API (normalize to lowercase for comparison) */
export const CHECKOUT_GATEWAY = {
  EGNANOW: 'egnanow',
  KOWRI: 'kowri',
  PAYSTACK: 'paystack',
} as const

/** Egnanow mobile money paypartner codes */
export const EGNANOW_PAYPARTNER = {
  MTN: 'MTNGH',
  AIRTELTIGO: 'ATGH',
  TELECEL: 'TCELGH',
} as const

/** Kowri mobile money provider codes */
export const KOWRI_PROVIDER = {
  MTN: 'MTN_MONEY',
  AIRTELTIGO: 'AIRTELTIGO_MONEY',
  TELECEL: 'VODAFONE_CASH',
} as const

/** Ghana mobile prefixes to network (3-digit local e.g. 024, or 2-digit after 233) */
export const PHONE_PREFIX_NETWORK: Record<string, 'MTN' | 'AirtelTigo' | 'Telecel'> = {
  '024': 'MTN',
  '054': 'MTN',
  '055': 'MTN',
  '059': 'MTN',
  '24': 'MTN',
  '54': 'MTN',
  '55': 'MTN',
  '59': 'MTN',
  '026': 'AirtelTigo',
  '056': 'AirtelTigo',
  '26': 'AirtelTigo',
  '56': 'AirtelTigo',
  '020': 'Telecel',
  '050': 'Telecel',
  '20': 'Telecel',
  '50': 'Telecel',
}

export function getNetworkFromPhone(phone: string): 'MTN' | 'AirtelTigo' | 'Telecel' | null {
  const normalized = phone.replace(/\D/g, '').trim()
  if (normalized.length < 2) return null
  const prefix3 = normalized.startsWith('233') ? normalized.slice(3, 6) : normalized.slice(0, 3)
  const prefix2 = normalized.startsWith('233') ? normalized.slice(3, 5) : normalized.slice(0, 2)
  return PHONE_PREFIX_NETWORK[prefix3] ?? PHONE_PREFIX_NETWORK[prefix2] ?? null
}
