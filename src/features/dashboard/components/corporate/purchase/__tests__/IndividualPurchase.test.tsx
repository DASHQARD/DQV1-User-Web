import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import IndividualPurchase from '../individualPurchase'

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

describe('IndividualPurchase (corporate)', () => {
  it('renders Individual Purchases heading with count', () => {
    renderWithProviders(<IndividualPurchase />)
    expect(screen.getByText(/Individual Purchases \(0\)/i)).toBeInTheDocument()
  })

  it('renders table', () => {
    renderWithProviders(<IndividualPurchase />)
    const tables = screen.getAllByRole('table')
    expect(tables.length).toBeGreaterThan(0)
  })
})
