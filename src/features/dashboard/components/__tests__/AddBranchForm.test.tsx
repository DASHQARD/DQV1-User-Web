import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import AddBranchForm from '../AddBranchForm'

beforeEach(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockCloseModal = vi.fn()
const mockIsModalOpen = vi.fn().mockReturnValue(false)
const mockUseGetUserProfileService = vi.fn().mockReturnValue({ data: { branches: [] }, isLoading: false })
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    useUserProfile: () => ({
      useGetUserProfileService: mockUseGetUserProfileService,
    }),
    usePersistedModalState: () => ({
      isModalOpen: mockIsModalOpen,
      closeModal: mockCloseModal,
    }),
    useCountriesData: () => ({ countries: [] }),
  }
})

vi.mock('@/features/auth/hooks', () => ({
  useAuth: () => ({
    useGetCountriesService: () => ({ data: [] }),
  }),
}))

const mockMutate = vi.fn()
vi.mock('../vendor/hooks/useVendorMutations', () => ({
  useVendorMutations: () => ({
    useAddBranchService: () => ({ mutate: mockMutate, isPending: false }),
  }),
}))

describe('AddBranchForm', () => {
  beforeEach(() => {
    mockIsModalOpen.mockReturnValue(false)
    mockMutate.mockClear()
  })

  it('does not render modal content when create branch modal is closed', () => {
    mockIsModalOpen.mockReturnValue(false)
    renderWithProviders(<AddBranchForm />)
    expect(screen.queryByText('Add Branch')).not.toBeInTheDocument()
  })

  it('renders Add Branch modal when create branch modal is open', () => {
    mockIsModalOpen.mockReturnValue(true)
    renderWithProviders(<AddBranchForm />)
    expect(screen.getByRole('heading', { name: 'Add Branch' })).toBeInTheDocument()
  })

  it('shows existing branches section when user has branches', () => {
    mockIsModalOpen.mockReturnValue(true)
    mockUseGetUserProfileService.mockReturnValue({
      data: { branches: [{ id: 1, branch_name: 'Branch A' }] },
      isLoading: false,
    })
    renderWithProviders(<AddBranchForm />)
    expect(screen.getByText('Existing Branches')).toBeInTheDocument()
  })
})
