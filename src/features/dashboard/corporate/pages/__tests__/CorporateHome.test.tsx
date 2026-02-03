import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import CorporateHome from '../home/CorporateHome'

vi.mock('@/features/dashboard/corporate/hooks/useCorporateHome', () => ({
  useCorporateHome: () => ({
    metrics: {},
    formatCurrency: (val: number) => `$${val}`,
    isLoading: false,
    isCorporateAdmin: false,
    onboardingProgress: {
      hasProfileAndID: false,
      hasBusinessDetailsAndDocs: false,
    },
    completedCount: 0,
    totalCount: 2,
    progressPercentage: 0,
    isComplete: false,
    isPendingAndKYCComplete: false,
    canAccessRestrictedFeatures: false,
    handleContinue: vi.fn(),
    getNextStepName: () => 'Profile Information & ID Upload',
    navigateToProfileStep: vi.fn(),
    navigateToBusinessStep: vi.fn(),
  }),
}))

describe('CorporateHome (corporate)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dashboard overview title', () => {
    const { getByText } = renderWithProviders(<CorporateHome />)
    expect(getByText(/dashboard overview/i)).toBeInTheDocument()
  })

  it('renders corporate onboarding section when not complete', () => {
    const { getAllByText } = renderWithProviders(<CorporateHome />)
    expect(getAllByText(/complete your onboarding/i).length).toBeGreaterThan(0)
    expect(getAllByText(/corporate onboarding/i).length).toBeGreaterThan(0)
  })

  it('renders continue button', () => {
    const { getByRole } = renderWithProviders(<CorporateHome />)
    expect(getByRole('button', { name: /continue with profile information/i })).toBeInTheDocument()
  })

  it('renders progress steps', () => {
    const { getAllByText } = renderWithProviders(<CorporateHome />)
    expect(getAllByText(/profile information & id upload/i).length).toBeGreaterThan(0)
    expect(getAllByText(/business details & documents/i).length).toBeGreaterThan(0)
  })
})
