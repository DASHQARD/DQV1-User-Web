import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import CompleteVendorWidget from '../CompleteVendorWidget'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/hooks', () => ({
  useUserProfile: () => ({
    useGetUserProfileService: () => ({
      data: {
        user_type: 'vendor',
        onboarding_progress: {
          personal_details_completed: false,
          upload_id_completed: false,
          business_details_completed: false,
          business_documents_completed: false,
        },
      },
    }),
  }),
}))

vi.mock('@/features', () => ({
  vendorQueries: () => ({
    useBranchesService: () => ({ data: [] }),
  }),
}))

describe('CompleteVendorWidget', () => {
  it('renders collapsed vendor onboarding prompt', () => {
    renderWithProviders(<CompleteVendorWidget />)
    expect(screen.getByText(/complete your vendor onboarding/i)).toBeInTheDocument()
    expect(
      screen.getByText(/finish your profile to activate your vendor account/i),
    ).toBeInTheDocument()
  })

  it('expands when header is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CompleteVendorWidget />)
    await user.click(screen.getByRole('button', { name: /complete your vendor onboarding/i }))
    expect(screen.getByText(/complete your vendor onboarding process/i)).toBeInTheDocument()
    expect(screen.getByText(/progress/i)).toBeInTheDocument()
    expect(screen.getAllByText(/profile information & id upload/i).length).toBeGreaterThan(0)
  })

  it('Continue button navigates with account param', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CompleteVendorWidget />)
    await user.click(screen.getByRole('button', { name: /complete your vendor onboarding/i }))
    const continueBtn = screen.getByRole('button', { name: /continue with profile information/i })
    await user.click(continueBtn)
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('account=vendor'))
  })
})
