import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import BecomeVendorWidget from '../BecomeVendorWidget'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockUseGetUserProfileService = vi.fn().mockReturnValue({ data: null })
const mockUseBranchesService = vi.fn().mockReturnValue({ data: null })
vi.mock('@/hooks', () => ({
  useUserProfile: () => ({ useGetUserProfileService: mockUseGetUserProfileService }),
}))
vi.mock('@/features', () => ({
  vendorQueries: () => ({ useBranchesService: mockUseBranchesService }),
}))

describe('BecomeVendorWidget', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockUseGetUserProfileService.mockReturnValue({ data: null })
    mockUseBranchesService.mockReturnValue({ data: null })
  })

  it('renders collapsed state with title', () => {
    renderWithProviders(<BecomeVendorWidget />)
    expect(screen.getByText('Complete your onboarding process')).toBeInTheDocument()
    expect(
      screen.getByText(/Finish your profile to activate your corporate account/),
    ).toBeInTheDocument()
  })

  it('expands when header is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BecomeVendorWidget />)
    await user.click(screen.getByRole('button', { name: /complete your onboarding/i }))
    expect(
      screen.getByText(/Finish all 3 steps to activate your corporate account/),
    ).toBeInTheDocument()
    expect(screen.getByText('Progress')).toBeInTheDocument()
  })

  it('shows progress and checklist when expanded', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BecomeVendorWidget />)
    await user.click(screen.getByRole('button', { name: /complete your onboarding/i }))
    expect(
      screen.getAllByText(/Profile Information & Identity Documents/).length,
    ).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Business Details & Documentation/)).toBeInTheDocument()
    expect(screen.getByText(/Create Your First Branch/)).toBeInTheDocument()
  })

  it('navigates with account=corporate when Continue is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BecomeVendorWidget />)
    await user.click(screen.getByRole('button', { name: /complete your onboarding/i }))
    const continueBtn = screen.getByRole('button', { name: /Continue with Profile Information/ })
    await user.click(continueBtn)
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('account=corporate'))
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/compliance\/profile/))
  })

  it('shows onboarding complete when all steps done', async () => {
    mockUseGetUserProfileService.mockReturnValue({
      data: {
        fullname: 'Test',
        street_address: 'Addr',
        dob: '1990-01-01',
        id_number: '123',
        id_images: [{}],
        business_details: [{}],
        business_documents: [{}],
      },
    })
    mockUseBranchesService.mockReturnValue({ data: [{ id: 1 }] })
    const user = userEvent.setup()
    renderWithProviders(<BecomeVendorWidget />)
    await user.click(screen.getByRole('button', { name: /complete your onboarding/i }))
    expect(screen.getByRole('button', { name: 'Onboarding Complete' })).toBeInTheDocument()
  })
})
