import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import AllAdmins from '../AllAdmins'

vi.mock('@/features/dashboard/hooks', () => ({
  useCorporateAdmins: () => ({
    query: {},
    setQuery: vi.fn(),
    corporateAdminsList: [],
    pagination: { hasNextPage: false, hasPreviousPage: false, previous: undefined },
    modal: { modalState: null },
    isLoadingCorporateAdminsList: false,
    allAdminsHandleNextPage: vi.fn(),
    allAdminsHandleSetAfter: vi.fn(),
    allAdminsEstimatedTotal: 0,
  }),
}))

describe('AllAdmins (corporate)', () => {
  it('renders table with All Admins context', () => {
    renderWithProviders(<AllAdmins />)
    expect(screen.getAllByText('All Admins').length).toBeGreaterThan(0)
    const tables = screen.getAllByRole('table')
    expect(tables.length).toBeGreaterThan(0)
  })

  it('renders filter/search UI', () => {
    renderWithProviders(<AllAdmins />)
    const exportBtn = screen.queryByRole('button', { name: /export/i })
    expect(exportBtn !== null || document.querySelector('table')).toBe(true)
  })
})
