import { useEffect, useState } from 'react'
import { useDebouncedValue } from '@/hooks'
import {
  convertToInternationalFormat,
  resolveMomoAccountName,
} from '@/features/dashboard/services/redemptions'
import { interpretMomoResolveResponse } from '@/features/website/utils/momoResolve'

export function useRedemptionVendorMobileMoney(enabled: boolean) {
  const [rawVendorPhone, setRawVendorPhone] = useState('')
  const debouncedVendorPhone = useDebouncedValue(enabled ? rawVendorPhone : '', 800)
  const [validatingVendor, setValidatingVendor] = useState(false)
  const [vendorPhoneError, setVendorPhoneError] = useState<string | null>(null)
  const [vendorPhoneName, setVendorPhoneName] = useState<string | null>(null)
  const [momoResolveWarning, setMomoResolveWarning] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return

    const digits = debouncedVendorPhone.replace(/[^0-9]/g, '')
    if (!debouncedVendorPhone || digits.length < 10) {
      setVendorPhoneName(null)
      setVendorPhoneError(null)
      setMomoResolveWarning(null)
      setValidatingVendor(false)
      return
    }

    let cancelled = false
    setValidatingVendor(true)
    setVendorPhoneError(null)
    setVendorPhoneName(null)
    setMomoResolveWarning(null)

    const phone_number = convertToInternationalFormat(debouncedVendorPhone)

    resolveMomoAccountName({ phone_number })
      .then((response) => {
        if (cancelled) return
        const { vendorPhoneName, vendorPhoneError, momoResolveWarning } =
          interpretMomoResolveResponse(response)
        setVendorPhoneName(vendorPhoneName)
        setVendorPhoneError(vendorPhoneError)
        setMomoResolveWarning(momoResolveWarning)
      })
      .catch((err: { message?: string }) => {
        if (cancelled) return
        setVendorPhoneError(err?.message || 'Could not verify this mobile money number.')
        setVendorPhoneName(null)
      })
      .finally(() => {
        if (!cancelled) setValidatingVendor(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedVendorPhone, enabled])

  const resetVendorMobileMoney = () => {
    setRawVendorPhone('')
    setVendorPhoneName(null)
    setVendorPhoneError(null)
    setMomoResolveWarning(null)
    setValidatingVendor(false)
  }

  const isVendorPhoneVerified = !!(vendorPhoneName && !vendorPhoneError)

  return {
    rawVendorPhone,
    setRawVendorPhone,
    validatingVendor,
    vendorPhoneError,
    vendorPhoneName,
    momoResolveWarning,
    isVendorPhoneVerified,
    resetVendorMobileMoney,
  }
}
