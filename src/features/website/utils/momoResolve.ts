import type { ResolveMomoNameResponse } from '@/types/redemptions'

export type MomoResolveUiState = {
  vendorPhoneName: string | null
  vendorPhoneError: string | null
  momoResolveWarning: string | null
}

const MOMO_UNRESOLVED_ERROR =
  'We could not confirm the account holder name for this mobile money number. Please check the number and try again.'

const MOMO_GENERIC_ERROR =
  'Could not verify this mobile money number. Please check and try again.'

const MOMO_PARTIAL_WARNING =
  'Account name could not be confirmed with the network. Please verify the number before continuing.'

/** Map POST /redemptions/momo/resolve-name body to UI state (ignore misleading top-level message). */
export function interpretMomoResolveResponse(
  response: ResolveMomoNameResponse | undefined,
): MomoResolveUiState {
  const data = response?.data
  const accountName = data?.account_name?.trim() || ''
  const platformVendorName =
    data?.is_platform_vendor && data?.vendor_name?.trim() ? data.vendor_name.trim() : ''
  const displayName = accountName || platformVendorName || null

  if (displayName && data?.is_resolved === true) {
    return {
      vendorPhoneName: displayName,
      vendorPhoneError: null,
      momoResolveWarning: null,
    }
  }

  if (displayName && data?.is_resolved === false) {
    return {
      vendorPhoneName: displayName,
      vendorPhoneError: null,
      momoResolveWarning: MOMO_PARTIAL_WARNING,
    }
  }

  return {
    vendorPhoneName: null,
    vendorPhoneError: data?.is_resolved === false ? MOMO_UNRESOLVED_ERROR : MOMO_GENERIC_ERROR,
    momoResolveWarning: null,
  }
}
