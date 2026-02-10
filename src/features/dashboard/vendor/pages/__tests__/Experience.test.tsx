import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import Experience from '../experience/Experience'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  }
})

vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  const stableUser = { user_type: 'vendor' }
  return {
    ...actual,
    useUserProfile: () => ({
      useGetUserProfileService: () => ({ data: stableUser }),
    }),
    useReducerSpread: () => [
      { limit: 10 },
      vi.fn(),
    ],
  }
})

vi.mock('@/features', () => ({
  vendorQueries: () => ({
    useGetCardsByVendorIdService: () => ({ data: { data: [], pagination: {} }, isLoading: false }),
  }),
}))

vi.mock('@/features/dashboard/branch', () => ({
  branchQueries: () => ({
    useGetBranchExperiencesService: () => ({ data: null, isLoading: false }),
  }),
}))

vi.mock('@/features/dashboard/corporate/hooks/useCorporateQueries', () => ({
  corporateQueries: () => ({
    useGetCorporateCardsService: () => ({ data: null, isLoading: false }),
    useGetCorporateSuperAdminCardsService: () => ({ data: null, isLoading: false }),
    useGetCardsByVendorIdForCorporateService: () => ({ data: null, isLoading: false }),
  }),
}))

vi.mock('@/features/dashboard/components', () => ({
  CreateExperience: () => <button type="button">Create Experience</button>,
  ViewExperience: () => null,
  EditExperience: () => null,
  DeleteExperience: () => null,
  experienceListColumns: [],
  experienceListCsvHeaders: [],
  VendorSummaryCards: () => <div data-testid="vendor-summary-cards">Summary</div>,
}))

describe('Experience (vendor)', () => {
  it('renders My Experiences heading', () => {
    renderWithProviders(<Experience />)
    expect(screen.getByText('My Experiences')).toBeInTheDocument()
  })

  it('renders VendorSummaryCards and Create Experience', () => {
    renderWithProviders(<Experience />)
    expect(screen.getByTestId('vendor-summary-cards')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Experience/i })).toBeInTheDocument()
  })
})
