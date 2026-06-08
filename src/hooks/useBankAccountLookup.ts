import { useEffect, useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedState'
import { resolveBankAccount } from '@/services/accountLookup'
import {
  interpretBankAccountLookupResponse,
  isValidBankAccountNumberForLookup,
} from '@/utils/accountLookupMappers'

export function useBankAccountLookup(options: {
  enabled: boolean
  accountNumber: string
  bankCode: string
  debounceMs?: number
}) {
  const { enabled, accountNumber, bankCode, debounceMs = 800 } = options
  const debouncedAccount = useDebouncedValue(enabled ? accountNumber : '', debounceMs)
  const debouncedBankCode = useDebouncedValue(enabled ? bankCode : '', debounceMs)

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

    const code = debouncedBankCode.trim()
    if (!code || !isValidBankAccountNumberForLookup(debouncedAccount)) {
      setAccountName(null)
      setError(null)
      setIsResolving(false)
      return
    }

    let cancelled = false
    setIsResolving(true)
    setError(null)
    setAccountName(null)

    resolveBankAccount({
      account_number: debouncedAccount.replace(/\D/g, ''),
      bank_code: code,
    })
      .then((response) => {
        if (cancelled) return
        const { accountName: resolvedName, error: resolveError } =
          interpretBankAccountLookupResponse(response)
        setAccountName(resolvedName)
        setError(resolveError)
      })
      .catch((err: { message?: string }) => {
        if (cancelled) return
        setAccountName(null)
        setError(
          err?.message ||
            'Bank account could not be verified. Please check the details and try again.',
        )
      })
      .finally(() => {
        if (!cancelled) setIsResolving(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedAccount, debouncedBankCode, enabled])

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
