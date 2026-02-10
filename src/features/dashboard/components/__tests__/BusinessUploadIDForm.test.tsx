import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import BusinessUploadIDForm from '../BusinessUploadIDForm'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockMutateAsync = vi.fn()
const mockUploadFiles = vi.fn()
const mockFetchPresignedURL = vi.fn()
const mockUseGetUserProfileService = vi.fn().mockReturnValue({ data: null })
vi.mock('@/hooks', () => ({
  useUserProfile: () => ({
    useGetUserProfileService: mockUseGetUserProfileService,
  }),
  useUploadFiles: () => ({ mutateAsync: mockUploadFiles, isPending: false }),
  usePresignedURL: () => ({ mutateAsync: mockFetchPresignedURL, isPending: false }),
  useToast: () => ({ toast: vi.fn(), success: vi.fn(), error: vi.fn() }),
}))
vi.mock('@/features/auth/hooks', () => ({
  useAuth: () => ({
    useBusinessUploadIDService: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  }),
}))

describe('BusinessUploadIDForm', () => {
  beforeEach(() => {
    mockMutateAsync.mockClear()
    mockUploadFiles.mockClear()
    mockFetchPresignedURL.mockClear()
    mockUseGetUserProfileService.mockReturnValue({ data: null })
  })

  it('renders form when no existing business documents', () => {
    renderWithProviders(<BusinessUploadIDForm />)
    expect(screen.getByText(/Submit the following documents/)).toBeInTheDocument()
    expect(screen.getAllByText(/Certificate of Incorporation/).length).toBeGreaterThanOrEqual(1)
  })

  it('prefills form when user has business_documents', async () => {
    mockUseGetUserProfileService.mockReturnValue({
      data: {
        business_documents: [
          {
            type: 'logo',
            file_url: 'key',
            employer_identification_number: 'EIN123',
            business_industry: 'retail',
          },
        ],
      },
    })
    mockFetchPresignedURL.mockResolvedValue('https://example.com/doc.pdf')
    renderWithProviders(<BusinessUploadIDForm />)
    await vi.waitFor(() => {
      expect(mockFetchPresignedURL).toHaveBeenCalled()
    })
  })
})
