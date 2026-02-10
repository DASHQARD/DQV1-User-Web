import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import { BranchDetails } from '../BranchDetails'
import { useBranchDetails } from '../useBranchDetails'

const mockGoToBranches = vi.fn()
const mockOpenModal = vi.fn()

vi.mock('../useBranchDetails', () => ({
  useBranchDetails: vi.fn(),
}))

function defaultMockReturn() {
  return {
    branchModal: { openModal: mockOpenModal },
    experienceModal: { openModal: vi.fn() },
    branchStatusModal: { openModal: vi.fn() },
    branches: null,
    experiences: [],
    recentRedemptions: [],
    branchSummary: null,
    isLoading: false,
    isError: false,
    errorMessage: '',
    isLoadingRedemptions: false,
    isLoadingCorporateBranchSummary: false,
    goToBranches: mockGoToBranches,
  }
}

describe('BranchDetails (vendor branches)', () => {
  beforeEach(() => {
    vi.mocked(useBranchDetails).mockReturnValue(defaultMockReturn())
  })

  it('shows loading state when isLoading is true', () => {
    vi.mocked(useBranchDetails).mockReturnValue({
      branchModal: { openModal: vi.fn() },
      experienceModal: { openModal: vi.fn() },
      branchStatusModal: { openModal: vi.fn() },
      branches: null,
      experiences: [],
      recentRedemptions: [],
      branchSummary: null,
      isLoading: true,
      isError: false,
      errorMessage: '',
      isLoadingRedemptions: false,
      isLoadingCorporateBranchSummary: false,
      goToBranches: mockGoToBranches,
    } as any)
    renderWithProviders(<BranchDetails />)
    expect(screen.getByAltText('loading')).toBeInTheDocument()
  })

  it('shows error state with message and Back to Branches button', () => {
    vi.mocked(useBranchDetails).mockReturnValue({
      branchModal: { openModal: vi.fn() },
      experienceModal: { openModal: vi.fn() },
      branchStatusModal: { openModal: vi.fn() },
      branches: null,
      experiences: [],
      recentRedemptions: [],
      branchSummary: null,
      isLoading: false,
      isError: true,
      errorMessage: 'Error loading branch details',
      isLoadingRedemptions: false,
      isLoadingCorporateBranchSummary: false,
      goToBranches: mockGoToBranches,
    } as any)
    renderWithProviders(<BranchDetails />)
    expect(screen.getByText('Error loading branch details')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back to Branches' })).toBeInTheDocument()
  })

  it('calls goToBranches when Back to Branches button is clicked in error state', async () => {
    vi.mocked(useBranchDetails).mockReturnValue({
      branchModal: { openModal: vi.fn() },
      experienceModal: { openModal: vi.fn() },
      branchStatusModal: { openModal: vi.fn() },
      branches: null,
      experiences: [],
      recentRedemptions: [],
      branchSummary: null,
      isLoading: false,
      isError: true,
      errorMessage: 'Branch not found',
      isLoadingRedemptions: false,
      isLoadingCorporateBranchSummary: false,
      goToBranches: mockGoToBranches,
    } as any)
    const user = userEvent.setup()
    renderWithProviders(<BranchDetails />)
    await user.click(screen.getByRole('button', { name: 'Back to Branches' }))
    expect(mockGoToBranches).toHaveBeenCalled()
  })

  it('renders branch name and content when branches data is present', () => {
    vi.mocked(useBranchDetails).mockReturnValue({
      branchModal: { openModal: mockOpenModal },
      experienceModal: { openModal: vi.fn() },
      branchStatusModal: { openModal: vi.fn() },
      branches: {
        branch_name: 'Accra Branch',
        branch_location: 'Accra, Ghana',
        status: 'approved',
        id: 1,
      },
      experiences: [],
      recentRedemptions: [],
      branchSummary: { total_redemptions: 0, total_redemption_amount: 0, total_cards: 0 },
      isLoading: false,
      isError: false,
      errorMessage: '',
      isLoadingRedemptions: false,
      isLoadingCorporateBranchSummary: false,
      goToBranches: mockGoToBranches,
    } as any)
    renderWithProviders(<BranchDetails />)
    expect(screen.getByText('Accra Branch')).toBeInTheDocument()
    expect(screen.getByText('Accra, Ghana')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back to Branches' })).toBeInTheDocument()
    expect(screen.getByText('Recent Redemptions')).toBeInTheDocument()
    expect(screen.getByText('Experiences')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View Branch Details' })).toBeInTheDocument()
  })

  it('shows Pending Approval when branch status is pending', () => {
    vi.mocked(useBranchDetails).mockReturnValue({
      branchModal: { openModal: vi.fn() },
      experienceModal: { openModal: vi.fn() },
      branchStatusModal: { openModal: vi.fn() },
      branches: {
        branch_name: 'Pending Branch',
        status: 'pending',
        id: 2,
      },
      experiences: [],
      recentRedemptions: [],
      branchSummary: null,
      isLoading: false,
      isError: false,
      errorMessage: '',
      isLoadingRedemptions: false,
      isLoadingCorporateBranchSummary: false,
      goToBranches: mockGoToBranches,
    } as any)
    renderWithProviders(<BranchDetails />)
    expect(screen.getByText('Pending Approval')).toBeInTheDocument()
  })

  it('shows empty redemptions state when no recent redemptions', () => {
    vi.mocked(useBranchDetails).mockReturnValue({
      branchModal: { openModal: vi.fn() },
      experienceModal: { openModal: vi.fn() },
      branchStatusModal: { openModal: vi.fn() },
      branches: { branch_name: 'Branch', id: 1 },
      experiences: [],
      recentRedemptions: [],
      branchSummary: null,
      isLoading: false,
      isError: false,
      errorMessage: '',
      isLoadingRedemptions: false,
      isLoadingCorporateBranchSummary: false,
      goToBranches: mockGoToBranches,
    } as any)
    renderWithProviders(<BranchDetails />)
    expect(screen.getByText('No Redemptions Yet')).toBeInTheDocument()
  })

  it('shows no experiences message when experiences array is empty', () => {
    vi.mocked(useBranchDetails).mockReturnValue({
      branchModal: { openModal: vi.fn() },
      experienceModal: { openModal: vi.fn() },
      branchStatusModal: { openModal: vi.fn() },
      branches: { branch_name: 'Branch', id: 1 },
      experiences: [],
      recentRedemptions: [],
      branchSummary: null,
      isLoading: false,
      isError: false,
      errorMessage: '',
      isLoadingRedemptions: false,
      isLoadingCorporateBranchSummary: false,
      goToBranches: mockGoToBranches,
    } as any)
    renderWithProviders(<BranchDetails />)
    expect(screen.getByText('No experiences created yet')).toBeInTheDocument()
  })
})
