/** Ghana local MSISDN without leading 0 — shown in phone field hints (with +233 dial code). */
export const EXAMPLE_PHONE_LOCAL = '5512345678'

export const EXAMPLE_PHONE_COUNTRY_CODE = '+233'

/** E.164 example used in placeholders and API/fixture data */
export const EXAMPLE_PHONE_E164 = `${EXAMPLE_PHONE_COUNTRY_CODE}${EXAMPLE_PHONE_LOCAL}`

/** National format with leading 0 */
export const EXAMPLE_PHONE_NATIONAL = `0${EXAMPLE_PHONE_LOCAL}`

export const PHONE_FORMAT_HINT_PREFIX = 'Please enter your number in the format:'

export const EXAMPLE_PHONE_PLACEHOLDER = `Enter number eg. ${EXAMPLE_PHONE_LOCAL}`

export const EXAMPLE_PHONE_PLACEHOLDER_E164 = EXAMPLE_PHONE_E164

export const EXAMPLE_PHONE_PLACEHOLDER_SHORT = 'Enter number'

/** Sequential E.164 examples for bulk-upload demos (5512345678 + index). */
export function examplePhoneE164AtIndex(index: number): string {
  const local = String(Number(EXAMPLE_PHONE_LOCAL) + index)
  return `${EXAMPLE_PHONE_COUNTRY_CODE}${local}`
}

/** Official DashQard support line (not the form example MSISDN). */
export const SUPPORT_PHONE_E164 = '+233542022245'
export const SUPPORT_PHONE_DISPLAY = '+233 (0)542 022 245'
export const SUPPORT_PHONE_DISPLAY_SHORT = '+233 54 202 2245'

/** Purchase / bulk gifting WhatsApp line. */
export const PURCHASE_WHATSAPP_E164 = '+233566080362'
export const PURCHASE_WHATSAPP_WA_ME = '233566080362'
export const PURCHASE_WHATSAPP_DISPLAY = '+233 56 608 0362'
