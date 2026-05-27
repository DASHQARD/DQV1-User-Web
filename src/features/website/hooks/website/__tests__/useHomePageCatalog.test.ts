import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useHomePageCatalog } from '../useHomePageCatalog'
import {
  PUBLIC_CATALOG_CARDS_QUERY,
  PUBLIC_VENDORS_QUERY,
} from '../../../constants/publicCatalog'

const usePublicCardsService = vi.fn()
const usePublicVendors = vi.fn()

vi.mock('../usePublicCatalogQueries', () => ({
  usePublicCatalogQueries: () => ({
    usePublicCardsService,
    usePublicVendors,
  }),
}))

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client }, children)
}

describe('useHomePageCatalog', () => {
  beforeEach(() => {
    usePublicCardsService.mockReturnValue({ data: [], isLoading: false })
    usePublicVendors.mockReturnValue({ data: [], isLoading: false })
  })

  it('requests cards and vendors with shared home catalog params', () => {
    renderHook(() => useHomePageCatalog(), { wrapper })

    expect(usePublicCardsService).toHaveBeenCalledWith(
      PUBLIC_CATALOG_CARDS_QUERY,
      expect.objectContaining({ staleTime: expect.any(Number) }),
    )
    expect(usePublicVendors).toHaveBeenCalledWith(
      PUBLIC_VENDORS_QUERY,
      expect.objectContaining({ staleTime: expect.any(Number) }),
    )
  })
})
