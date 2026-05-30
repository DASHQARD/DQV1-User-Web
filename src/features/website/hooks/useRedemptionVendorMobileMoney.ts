import { useEffect, useState } from 'react'
import {
  convertToInternationalFormat,
  detectMobileMoneyProvider,
} from '@/features/dashboard/services/redemptions'
import { useRedemptionMutation } from '@/features/dashboard/hooks'

export function useRedemptionVendorMobileMoney(enabled: boolean) {
  const { useValidateVendorMobileMoneyService } = useRedemptionMutation()
  const validateVendorMutation = useValidateVendorMobileMoneyService()
  const { mutate: validateMutate } = validateVendorMutation

  const [rawVendorPhone, setRawVendorPhone] = useState('')
  const [debouncedVendorPhone, setDebouncedVendorPhone] = useState('')
  const [validatingVendor, setValidatingVendor] = useState(false)
  const [vendorPhoneError, setVendorPhoneError] = useState<string | null>(null)
  const [vendorPhoneName, setVendorPhoneName] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    const timer = setTimeout(() => setDebouncedVendorPhone(rawVendorPhone), 800)
    return () => clearTimeout(timer)
  }, [rawVendorPhone, enabled])

  useEffect(() => {
    if (!enabled) return

    if (!debouncedVendorPhone || debouncedVendorPhone.replace(/[^0-9]/g, '').length < 10) {
      setVendorPhoneName(null)
      setVendorPhoneError(null)
      setValidatingVendor(false)
      return
    }

    const provider = detectMobileMoneyProvider(debouncedVendorPhone)
    if (!provider) {
      setVendorPhoneError(
        'Unable to detect mobile money provider. Please enter a valid Ghana phone number.',
      )
      setVendorPhoneName(null)
      setValidatingVendor(false)
      return
    }

    setValidatingVendor(true)
    setVendorPhoneError(null)
    setVendorPhoneName(null)

    validateMutate(
      { phone_number: convertToInternationalFormat(debouncedVendorPhone), provider },
      {
        onSuccess: (response: { data?: { vendor_name?: string; account_name?: string }; message?: string }) => {
          const name = response?.data?.vendor_name || response?.data?.account_name
          if (name) {
            setVendorPhoneName(name)
            setVendorPhoneError(null)
          } else {
            setVendorPhoneError(
              response?.message || 'Could not verify this mobile money number. Please check and try again.',
            )
            setVendorPhoneName(null)
          }
          setValidatingVendor(false)
        },
        onError: (err: { message?: string }) => {
          setVendorPhoneError(err?.message || 'Could not verify this mobile money number.')
          setVendorPhoneName(null)
          setValidatingVendor(false)
        },
      },
    )
  }, [debouncedVendorPhone, enabled, validateMutate])

  const resetVendorMobileMoney = () => {
    setRawVendorPhone('')
    setDebouncedVendorPhone('')
    setVendorPhoneName(null)
    setVendorPhoneError(null)
    setValidatingVendor(false)
  }

  const isVendorPhoneVerified = !!(vendorPhoneName && !vendorPhoneError)

  return {
    rawVendorPhone,
    setRawVendorPhone,
    validatingVendor: validatingVendor || validateVendorMutation.isPending,
    vendorPhoneError,
    vendorPhoneName,
    isVendorPhoneVerified,
    resetVendorMobileMoney,
  }
}
