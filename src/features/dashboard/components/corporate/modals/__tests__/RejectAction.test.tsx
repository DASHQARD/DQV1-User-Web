import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { RejectAction } from '../RejectAction'

let isRejectOpen = false
vi.mock('@/hooks', () => ({
  usePersistedModalState: () => ({
    openModal: vi.fn(),
    closeModal: vi.fn(),
    isModalOpen: () => isRejectOpen,
    modalData: { id: 1, request_id: 'REQ-001' },
  }),
}))

vi.mock('@/features/dashboard/corporate/hooks', () => ({
  corporateMutations: () => ({
    useUpdateRequestStatusService: () => ({ mutate: vi.fn(), isPending: false }),
  }),
}))

describe('RejectAction (corporate modal)', () => {
  it('when modal is open, shows Reject Request title and message', () => {
    isRejectOpen = true
    renderWithProviders(<RejectAction />)
    expect(screen.getByText('Reject Request')).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to reject this request\?/i)).toBeInTheDocument()
  })

  it('renders Cancel and Reject buttons', () => {
    isRejectOpen = true
    renderWithProviders(<RejectAction />)
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument()
  })
})
