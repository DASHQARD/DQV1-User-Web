import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import UserUploadIDForm from '../UserUploadIDForm'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockMutateAsync = vi.fn()
const mockUploadFiles = vi.fn()
const mockUseGetUserProfileService = vi.fn().mockReturnValue({ data: null, isLoading: false })
vi.mock('@/hooks', () => ({
  useUserProfile: () => ({
    useGetUserProfileService: mockUseGetUserProfileService,
  }),
  useUploadFiles: () => ({ mutateAsync: mockUploadFiles, isPending: false }),
  useToast: () => ({ toast: vi.fn(), success: vi.fn(), error: vi.fn() }),
}))
vi.mock('../../auth/hooks', () => ({
  useAuth: () => ({
    useUploadUserIDService: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  }),
}))

describe('UserUploadIDForm', () => {
  beforeEach(() => {
    mockMutateAsync.mockClear()
    mockUseGetUserProfileService.mockReturnValue({ data: null, isLoading: false })
  })

  it('shows loader when profile is loading', () => {
    mockUseGetUserProfileService.mockReturnValue({ data: null, isLoading: true })
    renderWithProviders(<UserUploadIDForm />)
    expect(screen.getByAltText('Loading...')).toBeInTheDocument()
  })

  it('renders upload form when no existing id_images', () => {
    mockUseGetUserProfileService.mockReturnValue({ data: { id_images: [] }, isLoading: false })
    renderWithProviders(<UserUploadIDForm />)
    expect(screen.getByText(/Upload your pictures of your identification/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
  })

  it('renders existing id section when user has id_images', () => {
    mockUseGetUserProfileService.mockReturnValue({
      data: { id_images: [{ file_url: 'a' }, { file_url: 'b' }], user_type: 'user' },
      isLoading: false,
    })
    renderWithProviders(<UserUploadIDForm />)
    expect(screen.getByText('Front of Identification')).toBeInTheDocument()
    expect(screen.getByText('Back of Identification')).toBeInTheDocument()
  })
})
