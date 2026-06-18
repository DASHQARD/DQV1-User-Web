import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

import { useVendorProfilePage } from '../useVendorProfilePage'

const useGetVendorRedemptionCatalogService = vi.fn()

vi.mock('@/features/dashboard/hooks', () => ({
  useRedemptionQueries: () => ({ useGetVendorRedemptionCatalogService }),
}))

const catalogFixture = {
  data: {
    vendor: {
      vendor_id: 'v-arsenal',
      vendor_name: 'arsenal',
      gvid: 'GH-0002',
      qr_code_url: 'https://app.dashqard.com/redeem?gvid=GH-0002',
      branches: [{ id: 'branch-1', branch_name: 'Main', branch_location: 'Accra' }],
    },
    cards: [],
  },
}

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return React.createElement(QueryClientProvider, { client }, children)
}

describe('useVendorProfilePage', () => {
  beforeEach(() => {
    useGetVendorRedemptionCatalogService.mockReset()
    useGetVendorRedemptionCatalogService.mockReturnValue({
      data: catalogFixture,
      isLoading: false,
    })
  })

  it('loads catalog by gvid only', () => {
    const { result } = renderHook(() => useVendorProfilePage('GH-0002'), { wrapper })

    expect(useGetVendorRedemptionCatalogService).toHaveBeenCalledWith('GH-0002', undefined, true)
    expect(result.current.displayName).toBe('Arsenal')
    expect(result.current.vendor?.vendor_id).toBe('v-arsenal')
    expect(result.current.catalogGvid).toBe('GH-0002')
  })

  it('loads numeric gvid formats like 4158-01', () => {
    renderHook(() => useVendorProfilePage('4158-01'), { wrapper })

    expect(useGetVendorRedemptionCatalogService).toHaveBeenCalledWith('4158-01', undefined, true)
  })

  it('rejects catalog when legacy vendor_id param does not match catalog vendor', () => {
    const { result } = renderHook(
      () => useVendorProfilePage('GH-0002', '019eda1c-8534-7415-a56e-a679e7e78178'),
      { wrapper },
    )

    expect(result.current.vendor).toBeNull()
  })
})
