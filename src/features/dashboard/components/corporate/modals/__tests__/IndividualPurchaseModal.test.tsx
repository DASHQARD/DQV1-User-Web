import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { IndividualPurchaseModal } from '../IndividualPurchaseModal'
import { MODALS } from '@/utils/constants'

let isIndividualPurchaseOpen = false
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    usePersistedModalState: () => ({
      openModal: vi.fn(),
      closeModal: vi.fn(),
      isModalOpen: () => isIndividualPurchaseOpen,
    }),
  }
})

vi.mock('@/features/dashboard/vendor', () => ({
  vendorQueries: () => ({
    useGetAllVendorsDetailsService: () => ({ data: [], isLoading: false }),
  }),
}))

vi.mock('@/features/dashboard/corporate', () => ({
  corporateQueries: () => ({
    useGetCardsService: () => ({ data: [], isLoading: false }),
  }),
}))

describe('IndividualPurchaseModal (corporate)', () => {
  it('when modal is closed, no dialog visible', () => {
    isIndividualPurchaseOpen = false
    const { container } = renderWithProviders(<IndividualPurchaseModal />)
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument()
  })

  it('when modal is open, shows Individual Purchase title and tabs', () => {
    isIndividualPurchaseOpen = true
    renderWithProviders(<IndividualPurchaseModal />)
    expect(screen.getByText('Individual Purchase')).toBeInTheDocument()
    expect(screen.getByText('Vendors')).toBeInTheDocument()
    expect(screen.getByText('My Purchases')).toBeInTheDocument()
  })
})
