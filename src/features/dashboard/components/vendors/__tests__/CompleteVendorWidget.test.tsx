import { describe, it, expect, vi, beforeEach } from 'vitest'
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

const mockUseVendorOnboardingProgress = vi.fn()

vi.mock('@/features/dashboard/hooks/useVendorOnboardingProgress', () => ({
  useVendorOnboardingProgress: () => mockUseVendorOnboardingProgress(),
}))

describe('CompleteVendorWidget', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockUseVendorOnboardingProgress.mockReturnValue({
      steps: [
        {
          id: 'profile',
          label: 'Profile Information & ID Upload',
          description: 'Complete your profile',
          path: '/dashboard/vendor/compliance/profile',
          completed: false,
        },
      ],
      completedCount: 0,
      totalCount: 1,
      progressPercentage: 0,
      isComplete: false,
      nextStep: {
        id: 'profile',
        label: 'Profile Information & ID Upload',
        description: 'Complete your profile',
        path: '/dashboard/vendor/compliance/profile',
        completed: false,
      },
      addAccountParam: (path: string) => `${path}?account=vendor`,
      isBranchManager: false,
      isCorporateSwitchedToVendor: false,
    })
  })

  it('renders collapsed vendor onboarding prompt', () => {
    renderWithProviders(<CompleteVendorWidget />)
    expect(screen.getByText(/complete your vendor onboarding/i)).toBeInTheDocument()
  })

  it('expands and navigates on continue', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CompleteVendorWidget />)
    await user.click(screen.getByRole('button', { name: /complete your vendor onboarding/i }))
    expect(screen.getByText(/0% complete/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /continue with profile information/i }))
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('account=vendor'))
  })

  it('returns null when onboarding is complete', () => {
    mockUseVendorOnboardingProgress.mockReturnValue({
      steps: [],
      completedCount: 4,
      totalCount: 4,
      progressPercentage: 100,
      isComplete: true,
      nextStep: null,
      addAccountParam: (path: string) => path,
      isBranchManager: false,
      isCorporateSwitchedToVendor: true,
    })
    const { container } = renderWithProviders(<CompleteVendorWidget />)
    expect(container).toBeEmptyDOMElement()
  })
})
