import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

import { PUBLIC_VENDORS_QUERY } from '../../../constants/publicCatalog'
import { useVendorProfilePage } from '../useVendorProfilePage'

const usePublicVendors = vi.fn()

vi.mock('../usePublicCatalogQueries', () => ({
  usePublicCatalogQueries: () => ({ usePublicVendors }),
}))

const arsenalVendor = {
  vendor_id: 'v-arsenal',
  business_name: 'arsenal',
  business_country: 'Ghana',
  branches_with_cards: [],
}

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return React.createElement(QueryClientProvider, { client }, children)
}

describe('useVendorProfilePage', () => {
  beforeEach(() => {
    usePublicVendors.mockReset()
  })

  it('uses shared PUBLIC_VENDORS_QUERY and selects vendor client-side', () => {
    usePublicVendors.mockReturnValue({
      data: [arsenalVendor, { vendor_id: 'v-other', business_name: 'Other' }],
      isLoading: false,
    })

    const { result } = renderHook(() => useVendorProfilePage('v-arsenal'), { wrapper })

    expect(usePublicVendors).toHaveBeenCalledWith(
      PUBLIC_VENDORS_QUERY,
      expect.objectContaining({ enabled: true }),
    )
    expect(result.current.displayName).toBe('Arsenal')
    expect(result.current.vendor?.vendor_id).toBe('v-arsenal')
  })
})
