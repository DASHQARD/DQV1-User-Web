import { useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks'
import { useRedemptionQueries } from '@/features/dashboard/hooks'
import {
  extractVendorSearchRows,
  findVendorSearchMatch,
  isExactGvidPathLookup,
  mergeVendorSearchResults,
} from '@/features/website/utils/cardsRedemption'

export function useRedemptionVendorLookup(enabled: boolean) {
  const { useSearchVendorsService, useSearchVendorByGvidService } = useRedemptionQueries()
  const [vendorIdInput, setVendorIdInput] = useState('')
  const debouncedVendorId = useDebouncedValue(enabled ? vendorIdInput.trim() : '', 500)

  const partialSearchTerm =
    debouncedVendorId.length >= 2 ? debouncedVendorId : undefined
  const exactGvidTerm = isExactGvidPathLookup(debouncedVendorId)
    ? debouncedVendorId
    : undefined

  const { data: partialSearchResponse, isFetching: isSearchingPartial } = useSearchVendorsService(
    enabled && partialSearchTerm ? { search: partialSearchTerm, limit: 20 } : undefined,
  )

  const { data: gvidSearchResponse, isFetching: isSearchingByGvid } = useSearchVendorByGvidService(
    enabled && exactGvidTerm ? exactGvidTerm : undefined,
  )

  const searchResults = useMemo(() => {
    const partial = extractVendorSearchRows(partialSearchResponse)
    const exact = extractVendorSearchRows(gvidSearchResponse)
    return mergeVendorSearchResults(partial, exact, Boolean(exactGvidTerm))
  }, [partialSearchResponse, gvidSearchResponse, exactGvidTerm])

  const exactIdMatch = useMemo(() => {
    if (!debouncedVendorId.trim()) return null
    return findVendorSearchMatch(debouncedVendorId, searchResults)
  }, [debouncedVendorId, searchResults])

  const resetVendorLookup = () => {
    setVendorIdInput('')
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
