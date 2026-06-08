import { useEffect, useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedState'
import { resolveMobileMoneyAccount } from '@/services/accountLookup'
import {
  interpretMobileMoneyLookupResponse,
  toLookupApiProvider,
} from '@/utils/accountLookupMappers'
import { convertToInternationalFormat, detectMobileMoneyProvider } from '@/features/dashboard/services/redemptions'

export function useMobileMoneyAccountLookup(options: {
  enabled: boolean
  rawPhone: string
  /** UI provider (`airteltigo`). Auto-detected from phone when omitted. */
  provider?: string | null
  debounceMs?: number
}) {
  const { enabled, rawPhone, provider, debounceMs = 800 } = options
  const debouncedPhone = useDebouncedValue(enabled ? rawPhone : '', debounceMs)

  const [isResolving, setIsResolving] = useState(false)
  const [accountName, setAccountName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setAccountName(null)
      setError(null)
      setIsResolving(false)
      return
    }

    const digits = debouncedPhone.replace(/[^0-9]/g, '')
    if (!debouncedPhone || digits.length < 10) {
      setAccountName(null)
      setError(null)
      setIsResolving(false)
      return
    }

    const detected = detectMobileMoneyProvider(debouncedPhone)
    const apiProvider =
      toLookupApiProvider(provider) ?? (detected ? toLookupApiProvider(detected) : null)

    if (!apiProvider) {
      setError('Unable to detect mobile money provider. Please select a provider or enter a valid Ghana phone number.')
      setAccountName(null)
      setIsResolving(false)
      return
    }

    let cancelled = false
    setIsResolving(true)
    setError(null)
    setAccountName(null)

    const phone_number = convertToInternationalFormat(debouncedPhone)

    resolveMobileMoneyAccount({ phone_number, provider: apiProvider })
      .then((response) => {
        if (cancelled) return
        const { accountName: resolvedName, error: resolveError } =
          interpretMobileMoneyLookupResponse(response)
        setAccountName(resolvedName)
        setError(resolveError)
      })
      .catch((err: { message?: string; status?: number }) => {
        if (cancelled) return
        setAccountName(null)
        setError(
          err?.message ||
            'Mobile money number could not be verified. Please check the details and try again.',
        )
      })
      .finally(() => {
        if (!cancelled) setIsResolving(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedPhone, enabled, provider])

  const reset = () => {
    setAccountName(null)
    setError(null)
    setIsResolving(false)
  }

  const isVerified = !!(accountName && !error)

  return {
    accountName,
    error,
    isResolving,
    isVerified,
    reset,
  }
}
