import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'

export function useUrlState(key: string, defaultValue?: string) {
  const [searchParams, setSearchParams] = useSearchParams()

  // Get current value from URL (memoized)
  const value = useMemo(() => {
    return searchParams.get(key) ?? defaultValue ?? ''
  }, [searchParams, key, defaultValue])

  // Update URL with new value
  const setValue = useCallback(
    (newValue: string) => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev)
          if (newValue) {
            newParams.set(key, newValue)
          } else {
            newParams.delete(key)
          }
          return newParams
        },
        { replace: true },
      )
    },
    [key, setSearchParams],
  )

  return [value, setValue] as const
}
