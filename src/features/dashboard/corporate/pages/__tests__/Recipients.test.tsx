import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import Recipients from '../recipients/Recipients'

vi.mock('@/features/dashboard/hooks', () => ({
  useCorporateRecipients: () => ({
    query: {},
    setQuery: vi.fn(),
    handleOpenCreateModal: vi.fn(),
    recipientsData: [],
    pagination: { hasNextPage: false, hasPreviousPage: false },
    isLoading: false,
    handleNextPage: vi.fn(),
    handleSetAfter: vi.fn(),
    estimatedTotal: 0,
    clearUnassigned: vi.fn(),
    isClearingUnassigned: false,
  }),
}))

describe('Recipients (corporate)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Recipients title', () => {
    const { getAllByText } = renderWithProviders(<Recipients />)
    expect(getAllByText(/^recipients$/i).length).toBeGreaterThan(0)
  })

  it('renders All recipients tab', () => {
    const { getByText } = renderWithProviders(<Recipients />)
    expect(getByText(/all recipients/i)).toBeInTheDocument()
  })

  it('renders Add Recipient button', () => {
    const { getByRole } = renderWithProviders(<Recipients />)
    expect(getByRole('button', { name: /add recipient/i })).toBeInTheDocument()
  })

  it('renders Clear unassigned button', () => {
    const { getByRole } = renderWithProviders(<Recipients />)
    expect(getByRole('button', { name: /clear unassigned/i })).toBeInTheDocument()
  })
})
