import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { BrowseCardsModal } from '../BrowseCardsModal'
import { MODALS } from '@/utils/constants'

let isBrowseCardsOpen = false
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    usePersistedModalState: () => ({
      openModal: vi.fn(),
      closeModal: vi.fn(),
      isModalOpen: () => isBrowseCardsOpen,
    }),
  }
})

vi.mock('@/features/dashboard/vendor/hooks', () => ({
  vendorQueries: () => ({
    useGetAllVendorsDetailsService: () => ({ data: [], isLoading: false }),
  }),
}))

vi.mock('@/features/dashboard/corporate/hooks', () => ({
  corporateQueries: () => ({
    useGetCardsService: () => ({ data: { data: [] }, isLoading: false }),
  }),
}))

describe('BrowseCardsModal (corporate)', () => {
  it('renders nothing visible when modal is closed', () => {
    isBrowseCardsOpen = false
    const { container } = renderWithProviders(<BrowseCardsModal />)
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument()
  })

  it('when modal is open, shows Browse Vendors title and content', () => {
    isBrowseCardsOpen = true
    renderWithProviders(<BrowseCardsModal />)
    expect(screen.getByText('Browse Vendors')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search vendors...')).toBeInTheDocument()
  })
})
