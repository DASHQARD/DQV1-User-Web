import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { VendorApproveAction } from '../VendorApproveAction'
import { MODALS } from '@/utils/constants'

const mockCloseModal = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams()],
  }
})

vi.mock('@/hooks', () => ({
  usePersistedModalState: () => ({
    openModal: vi.fn(),
    closeModal: mockCloseModal,
    isModalOpen: (name: string) => name === MODALS.REQUEST.CHILDREN.APPROVE,
    modalData: { id: 1 },
  }),
  useUserProfile: () => ({
    useGetUserProfileService: () => ({ data: { user_type: 'vendor' } }),
  }),
}))

vi.mock('@/features/dashboard/vendor/hooks', () => ({
  vendorMutations: () => ({
    useUpdateRequestStatusService: () => ({ mutate: vi.fn(), isPending: false }),
  }),
}))

vi.mock('@/features/dashboard/corporate/hooks/useCorporateMutations', () => ({
  corporateMutations: () => ({
    useUpdateCorporateSuperAdminVendorRequestStatusService: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
  }),
}))

describe('VendorApproveAction', () => {
  it('renders Approve Request title when modal is open', () => {
    renderWithProviders(<VendorApproveAction />)
    expect(screen.getByText('Approve Request')).toBeInTheDocument()
  })

  it('renders confirmation message', () => {
    renderWithProviders(<VendorApproveAction />)
    expect(screen.getByText(/are you sure you want to approve this request/i)).toBeInTheDocument()
  })

  it('renders Cancel and Approve buttons', () => {
    renderWithProviders(<VendorApproveAction />)
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument()
  })
})
