import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import Payments from '../payments/Payments'

vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    useReducerSpread: () => [{ limit: 10 }, vi.fn()],
  }
})

vi.mock('@/features', () => ({
  vendorQueries: () => ({
    useGetVendorPaymentsService: () => ({
      data: { data: [], pagination: {} },
      isLoading: false,
    }),
  }),
}))

vi.mock('@/features/dashboard/components/vendors/modals', () => ({
  BranchDetailsModal: () => null,
  DeleteBranchPaymentDetailsModal: () => null,
}))

describe('Payments (vendor)', () => {
  it('renders Payments heading', () => {
    renderWithProviders(<Payments />)
    expect(screen.getByText('Payments')).toBeInTheDocument()
  })

  it('renders payments count section', () => {
    renderWithProviders(<Payments />)
    expect(screen.getByText(/Payments \(0\)/)).toBeInTheDocument()
  })
})
