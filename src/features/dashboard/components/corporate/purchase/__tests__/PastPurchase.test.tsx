import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import PastPurchase from '../pastPurchase'

vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    useReducerSpread: () => [{}, vi.fn()],
  }
})

vi.mock('@/features/dashboard/corporate/hooks', () => ({
  corporateQueries: () => ({
    useGetAllCorporatePaymentsService: () => ({
      data: [],
      isLoading: false,
    }),
  }),
}))

describe('PastPurchase (corporate)', () => {
  it('renders Past Purchases heading with count', () => {
    renderWithProviders(<PastPurchase />)
    expect(screen.getByText(/Past Purchases \(0\)/i)).toBeInTheDocument()
  })

  it('renders table', () => {
    renderWithProviders(<PastPurchase />)
    const tables = screen.getAllByRole('table')
    expect(tables.length).toBeGreaterThan(0)
  })
})
