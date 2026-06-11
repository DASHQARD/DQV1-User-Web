import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import CompleteCorporateWidget from '../CompleteCorporateWidget'

vi.mock('@/hooks', () => ({
  useUserProfile: () => ({
    useGetUserProfileService: () => ({
      data: {
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

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => vi.fn() }
})

describe('CompleteCorporateWidget', () => {
  it('renders Complete your corporate onboarding when collapsed', () => {
    renderWithProviders(<CompleteCorporateWidget />)
    expect(screen.getByText(/complete your corporate onboarding/i)).toBeInTheDocument()
    expect(
      screen.getByText(/finish your profile to activate your corporate account/i),
    ).toBeInTheDocument()
  })

  it('expands when button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CompleteCorporateWidget />)
    await user.click(screen.getByRole('button', { name: /complete your corporate onboarding/i }))
    expect(screen.getByText(/complete your corporate onboarding process/i)).toBeInTheDocument()
    expect(screen.getByText(/finish all 2 steps/i)).toBeInTheDocument()
  })

  it('does not link to business details when that step is already complete', async () => {
    const hooks = await import('@/hooks')
    vi.spyOn(hooks, 'useUserProfile').mockReturnValue({
      useGetUserProfileService: () => ({
        data: {
          onboarding_progress: {
            personal_details_completed: false,
            upload_id_completed: false,
            business_details_completed: true,
            business_documents_completed: true,
          },
        },
      }),
    } as never)

    const user = userEvent.setup()
    const { container } = renderWithProviders(<CompleteCorporateWidget />)
    await user.click(screen.getByRole('button', { name: /complete your corporate onboarding/i }))

    expect(
      container.querySelector('a[href*="business-details"]'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Business Details & Documents')).toBeInTheDocument()
  })
})
