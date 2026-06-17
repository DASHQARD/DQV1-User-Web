import { useEffect, useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedState'
import { useMobileMoneyAccountLookup } from '@/hooks/useMobileMoneyAccountLookup'
import {
  convertToInternationalFormat,
  resolveGuestMomoName,
} from '@/features/dashboard/services/redemptions'
import { interpretMomoResolveResponse } from '@/features/website/utils/momoResolve'
import { toLookupApiProvider } from '@/utils/accountLookupMappers'
import { resolveRequestErrorMessage } from '@/utils/networkError'
import type { GuestMomoProvider } from '@/types/redemptions'

export function useRedemptionVendorMobileMoney(enabled: boolean, isGuestAuth = false) {
  const [rawVendorPhone, setRawVendorPhone] = useState('')

  const memberLookup = useMobileMoneyAccountLookup({
    enabled: enabled && !isGuestAuth,
    rawPhone: rawVendorPhone,
  })

  const debouncedGuestPhone = useDebouncedValue(enabled && isGuestAuth ? rawVendorPhone : '', 800)
  const [guestResolving, setGuestResolving] = useState(false)
  const [guestPhoneName, setGuestPhoneName] = useState<string | null>(null)
  const [guestPhoneError, setGuestPhoneError] = useState<string | null>(null)
  const [guestMomoWarning, setGuestMomoWarning] = useState<string | null>(null)
  const [guestProvider, setGuestProvider] = useState<GuestMomoProvider | null>(null)

  useEffect(() => {
    if (!enabled || !isGuestAuth) {
      setGuestResolving(false)
      setGuestPhoneName(null)
      setGuestPhoneError(null)
      setGuestMomoWarning(null)
      setGuestProvider(null)
      return
    }

    const digits = debouncedGuestPhone.replace(/[^0-9]/g, '')
    if (!debouncedGuestPhone || digits.length < 10) {
      setGuestResolving(false)
      setGuestPhoneName(null)
      setGuestPhoneError(null)
      setGuestMomoWarning(null)
      setGuestProvider(null)
      return
    }

    let cancelled = false
    setGuestResolving(true)
    setGuestPhoneError(null)
    setGuestPhoneName(null)
    setGuestMomoWarning(null)
    setGuestProvider(null)

    resolveGuestMomoName({ phone_number: convertToInternationalFormat(debouncedGuestPhone) })
      .then((response) => {
        if (cancelled) return
        const ui = interpretMomoResolveResponse(response)
        setGuestPhoneName(ui.vendorPhoneName)
        setGuestPhoneError(ui.vendorPhoneError)
        setGuestMomoWarning(ui.momoResolveWarning)

        const apiProvider = toLookupApiProvider(response?.data?.provider)
        setGuestProvider(apiProvider)
      })
      .catch((err: { message?: string }) => {
        if (cancelled) return
        setGuestPhoneName(null)
        setGuestMomoWarning(null)
        setGuestProvider(null)
        setGuestPhoneError(
          resolveRequestErrorMessage(
            err,
            'Could not verify this mobile money number. Please check and try again.',
          ),
        )
      })
      .finally(() => {
        if (!cancelled) setGuestResolving(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedGuestPhone, enabled, isGuestAuth])

  const resetGuestState = () => {
    setGuestResolving(false)
    setGuestPhoneName(null)
    setGuestPhoneError(null)
    setGuestMomoWarning(null)
    setGuestProvider(null)
  }

  const resetVendorMobileMoney = () => {
    setRawVendorPhone('')
    memberLookup.reset()
    resetGuestState()
  }

  if (isGuestAuth) {
    const isVendorPhoneVerified = !!(guestPhoneName && !guestPhoneError && guestProvider)
    return {
      rawVendorPhone,
      setRawVendorPhone,
      validatingVendor: guestResolving,
      vendorPhoneError: guestPhoneError,
      vendorPhoneName: guestPhoneName,
      momoResolveWarning: guestMomoWarning,
      isVendorPhoneVerified,
      resolvedProvider: guestProvider,
      resetVendorMobileMoney,
    }
  }

  return {
    rawVendorPhone,
    setRawVendorPhone,
    validatingVendor: memberLookup.isResolving,
    vendorPhoneError: memberLookup.error,
    vendorPhoneName: memberLookup.accountName,
    momoResolveWarning: null,
    isVendorPhoneVerified: memberLookup.isVerified,
    resolvedProvider: memberLookup.resolvedProvider,
    resetVendorMobileMoney,
  }
}
