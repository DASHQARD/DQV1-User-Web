import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import PurchaseModal from '../PurchaseModal/PurchaseModal'

vi.mock('@/assets/svgs/Dashx_bg.svg', () => ({ default: '/dashx.svg' }))
vi.mock('@/assets/svgs/dashpro_bg.svg', () => ({ default: '/dashpro.svg' }))
vi.mock('@/assets/images/dashpass_bg.png', () => ({ default: '/dashpass.png' }))
vi.mock('@/assets/svgs/dashgo_bg.svg', () => ({ default: '/dashgo.svg' }))

const stableUser = { fullname: 'Test', email: 'test@test.com', phonenumber: '' }

vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    usePersistedModalState: () => ({
      modalData: null,
      isOpen: false,
      openModal: vi.fn(),
      closeModal: vi.fn(),
      isModalOpen: () => false,
    }),
    useUserProfile: () => ({
      useGetUserProfileService: () => ({ data: stableUser }),
    }),
  }
})

vi.mock('@/features/dashboard/hooks', () => ({
  useRecipients: () => ({
    useAssignRecipientService: () => ({ mutate: vi.fn(), isPending: false }),
  }),
}))

describe('PurchaseModal', () => {
  it('does not show Add New Recipient when modal is closed', () => {
    renderWithProviders(<PurchaseModal />)
    expect(screen.queryByText('Add New Recipient')).not.toBeInTheDocument()
  })
})
