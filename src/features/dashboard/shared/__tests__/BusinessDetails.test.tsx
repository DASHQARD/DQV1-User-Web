import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen, waitFor } from '@/test/test-utils'
import BusinessDetails from '../BusinessDetails'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/hooks', () => ({
  useUserProfile: () => ({
    useGetUserProfileService: () => ({
      data: {
        onboarding_progress: {
          business_details_completed: false,
          business_documents_completed: false,
        },
      },
      isLoading: false,
    }),
  }),
}))

vi.mock('@/features/dashboard/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/dashboard/components')>()
  return {
    ...actual,
    BusinessDetailsForm: () => <div data-testid="business-details-form">BusinessDetailsForm</div>,
  }
})

describe('BusinessDetails (dashboard shared)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Settings back link', () => {
    renderWithProviders(<BusinessDetails />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders BusinessDetailsForm', () => {
    renderWithProviders(<BusinessDetails />)
    expect(screen.getByTestId('business-details-form')).toBeInTheDocument()
  })

  it('navigates back when Settings is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BusinessDetails />)
    await user.click(screen.getByText('Settings'))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('redirects to corporate home when business details were already submitted', async () => {
    const hooks = await import('@/hooks')
    vi.spyOn(hooks, 'useUserProfile').mockReturnValue({
      useGetUserProfileService: () => ({
        data: {
          onboarding_progress: {
            business_details_completed: true,
            business_documents_completed: true,
          },
        },
        isLoading: false,
      }),
    } as never)

    renderWithProviders(<BusinessDetails />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/corporate?account=corporate', {
        replace: true,
      })
    })
    expect(screen.queryByTestId('business-details-form')).not.toBeInTheDocument()
  })
})
