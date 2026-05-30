import { useEffect, useMemo, useState } from 'react'
import { useRedemptionQueries } from '@/features/dashboard/hooks'
import type { VendorSearchResult } from '@/types/redemptions'

export function useRedemptionVendorLookup(enabled: boolean) {
  const { useSearchVendorsService } = useRedemptionQueries()
  const [vendorIdInput, setVendorIdInput] = useState('')
  const [debouncedVendorId, setDebouncedVendorId] = useState('')

  useEffect(() => {
    if (!enabled) return
    const timer = setTimeout(() => setDebouncedVendorId(vendorIdInput.trim()), 500)
    return () => clearTimeout(timer)
  }, [vendorIdInput, enabled])

  const searchTerm = debouncedVendorId.length >= 2 ? debouncedVendorId : undefined
  const { data: searchResponse, isFetching: isSearchingById } = useSearchVendorsService(
    enabled && searchTerm ? { search: searchTerm } : undefined,
  )

  const searchResults = useMemo(() => {
    const rows = (searchResponse as { data?: VendorSearchResult[] } | undefined)?.data
    return Array.isArray(rows) ? rows : []
  }, [searchResponse])

  const exactIdMatch = useMemo(() => {
    if (!debouncedVendorId.trim()) return null
    const normalized = debouncedVendorId.trim().toLowerCase()
    return (
      searchResults.find(
        (row) =>
          row.gvid?.toLowerCase() === normalized ||
          row.vendor_id?.toLowerCase() === normalized,
      ) ?? null
    )
  }, [debouncedVendorId, searchResults])

  const resetVendorLookup = () => {
    setVendorIdInput('')
    setDebouncedVendorId('')
  }

  return {
    vendorIdInput,
    setVendorIdInput,
    debouncedVendorId,
    searchResults,
    exactIdMatch,
    isSearchingById,
    resetVendorLookup,
  }
}
