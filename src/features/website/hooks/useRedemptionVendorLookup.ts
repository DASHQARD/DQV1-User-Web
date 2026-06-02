import { useEffect, useMemo, useState } from 'react'
import { useRedemptionQueries } from '@/features/dashboard/hooks'
import { isFullGvidInput } from '@/features/website/utils/cardsRedemption'
import type { VendorSearchResult } from '@/types/redemptions'

export function useRedemptionVendorLookup(enabled: boolean) {
  const { useSearchVendorsService, useSearchVendorByGvidService } = useRedemptionQueries()
  const [vendorIdInput, setVendorIdInput] = useState('')
  const [debouncedVendorId, setDebouncedVendorId] = useState('')

  useEffect(() => {
    if (!enabled) return
    const timer = setTimeout(() => setDebouncedVendorId(vendorIdInput.trim()), 500)
    return () => clearTimeout(timer)
  }, [vendorIdInput, enabled])

  const isExactGvidLookup = isFullGvidInput(debouncedVendorId)
  const partialSearchTerm =
    !isExactGvidLookup && debouncedVendorId.length >= 2 ? debouncedVendorId : undefined

  const { data: partialSearchResponse, isFetching: isSearchingPartial } = useSearchVendorsService(
    enabled && partialSearchTerm ? { search: partialSearchTerm } : undefined,
  )

  const { data: gvidSearchResponse, isFetching: isSearchingByGvid } = useSearchVendorByGvidService(
    enabled && isExactGvidLookup ? debouncedVendorId : undefined,
  )

  const searchResults = useMemo(() => {
    const response = isExactGvidLookup ? gvidSearchResponse : partialSearchResponse
    const rows = (response as { data?: VendorSearchResult[] } | undefined)?.data
    return Array.isArray(rows) ? rows : []
  }, [isExactGvidLookup, gvidSearchResponse, partialSearchResponse])

  const exactIdMatch = useMemo(() => {
    if (!debouncedVendorId.trim()) return null
    if (isExactGvidLookup) {
      return searchResults[0] ?? null
    }
    const normalized = debouncedVendorId.trim().toLowerCase()
    return (
      searchResults.find(
        (row) =>
          row.gvid?.toLowerCase() === normalized || row.vendor_id?.toLowerCase() === normalized,
      ) ?? null
    )
  }, [debouncedVendorId, isExactGvidLookup, searchResults])

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
    isSearchingById: isSearchingPartial || isSearchingByGvid,
    resetVendorLookup,
  }
}
