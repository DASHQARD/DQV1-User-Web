import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import BranchHome from '../home/BranchHome'
import { useBranchHome } from '@/features/dashboard/branch/hooks/useBranchHome'

const mockAddAccountParam = vi.fn((path: string) => `${path}?account=branch`)

vi.mock('@/features/dashboard/branch/hooks/useBranchHome', () => ({
  useBranchHome: vi.fn(),
}))

vi.mock('@/features/dashboard/components', () => ({
  CompleteVendorWidget: () => null,
}))

vi.mock('@/features/dashboard/branch/metricCards', () => ({
  MetricsCard: ({ label, value }: { label: string; value: string }) => (
    <div data-testid="metrics-card">
      {label}: {value}
    </div>
  ),
}))

const defaultMockReturn = {
  isLoading: false,
  isLoadingRedemptions: false,
  isLoadingBranchExperiences: false,
  branchExperiences: [],
  recentRedemptions: [],
  addAccountParam: mockAddAccountParam,
  branchOnboardingProgress: {
    hasPersonalDetailsAndID: false,
    hasPaymentDetails: false,
  },
  branchOnboardingComplete: false,
  branchOnboardingSteps: {
    completed: 0,
    total: 2,
    percentage: 0,
  },
  metrics: {
    totalDashXRedeemed: 0,
    totalDashPassRedeemed: 0,
    pendingPayout: 0,
  },
}

describe('BranchHome (branch)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useBranchHome).mockReturnValue(defaultMockReturn as any)
  })

  it('renders dashboard title', () => {
    const { getByText, getAllByText } = renderWithProviders(<BranchHome />)
    expect(getAllByText(/Dashboard/i).length).toBeGreaterThan(0)
    expect(getByText('Branch Manager Dashboard')).toBeInTheDocument()
  })

  it('renders branch onboarding section when onboarding is not complete', () => {
    const { getByText, getAllByText } = renderWithProviders(<BranchHome />)
    expect(getAllByText(/Branch Manager Onboarding/i).length).toBeGreaterThan(0)
    expect(getAllByText(/Complete your onboarding/i).length).toBeGreaterThan(0)
    expect(getByText(/Progress/i)).toBeInTheDocument()
    expect(getByText(/0% Complete/i)).toBeInTheDocument()
  })

  it('renders onboarding steps when not complete', () => {
    const { getByText } = renderWithProviders(<BranchHome />)
    expect(getByText(/Personal Details & ID Upload/i)).toBeInTheDocument()
    expect(getByText(/Payment Details/i)).toBeInTheDocument()
  })

  it('shows loader when isLoading is true', () => {
    vi.mocked(useBranchHome).mockReturnValue({
      ...defaultMockReturn,
      isLoading: true,
    } as any)
    const { container } = renderWithProviders(<BranchHome />)
    // Loader is rendered (component may use Loader from @/components)
    expect(
      container.querySelector('[class*="flex items-center justify-center"]'),
    ).toBeInTheDocument()
  })

  it('renders metrics and main content when onboarding is complete', () => {
    vi.mocked(useBranchHome).mockReturnValue({
      ...defaultMockReturn,
      branchOnboardingComplete: true,
      branchOnboardingProgress: {
        hasPersonalDetailsAndID: true,
        hasPaymentDetails: true,
      },
      branchOnboardingSteps: {
        completed: 2,
        total: 2,
        percentage: 100,
      },
    } as any)
    const { getByText } = renderWithProviders(<BranchHome />)
    expect(getByText(/Total DashX Redeemed/i)).toBeInTheDocument()
    expect(getByText(/Total DashPass Redeemed/i)).toBeInTheDocument()
    expect(getByText(/Pending Payout/i)).toBeInTheDocument()
    expect(getByText(/Recent Redemptions/i)).toBeInTheDocument()
    expect(getByText(/My Experiences/i)).toBeInTheDocument()
  })

  it('renders View all link for redemptions when onboarding complete', () => {
    vi.mocked(useBranchHome).mockReturnValue({
      ...defaultMockReturn,
      branchOnboardingComplete: true,
    } as any)
    renderWithProviders(<BranchHome />)
    const viewAllLinks = document.querySelectorAll('a[href*="redemptions"]')
    expect(viewAllLinks.length).toBeGreaterThan(0)
  })

  it('renders empty state for redemptions when list is empty and onboarding complete', () => {
    vi.mocked(useBranchHome).mockReturnValue({
      ...defaultMockReturn,
      branchOnboardingComplete: true,
      isLoadingRedemptions: false,
      recentRedemptions: [],
    } as any)
    const { getByText } = renderWithProviders(<BranchHome />)
    expect(getByText(/No Redemptions Yet/i)).toBeInTheDocument()
  })
})
