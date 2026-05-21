import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import Experience from '../experience/Experience'

const { mockUserType } = vi.hoisted(() => ({
  mockUserType: { current: 'vendor' as string },
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  }
})

vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    useUserProfile: () => ({
      useGetUserProfileService: () => ({ data: { user_type: mockUserType.current } }),
    }),
    useReducerSpread: () => [{ limit: 10 }, vi.fn()],
  }
})

vi.mock('@/features', () => ({
  vendorQueries: () => ({
    useGetCardsByVendorIdService: () => ({ data: { data: [], pagination: {} }, isLoading: false }),
  }),
}))

vi.mock('@/features/dashboard/branch', () => ({
  branchQueries: () => ({
    useGetBranchExperiencesService: () => ({
      data: { data: [], pagination: {} },
      isLoading: false,
    }),
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

vi.mock('@/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components')>()
  return {
    ...actual,
    PaginatedTable: (props: { noSearch?: boolean; searchPlaceholder?: string }) => (
      <div data-testid="paginated-table" data-no-search={props.noSearch ? 'true' : 'false'}>
        {!props.noSearch && props.searchPlaceholder ? (
          <input placeholder={props.searchPlaceholder} readOnly />
        ) : null}
      </div>
    ),
  }
})

describe('Experience (vendor)', () => {
  beforeEach(() => {
    mockUserType.current = 'vendor'
  })

  it('renders My Experiences heading', () => {
    renderWithProviders(<Experience />)
    expect(screen.getByText('My Experiences')).toBeInTheDocument()
  })

  it('renders VendorSummaryCards and Create Experience', () => {
    renderWithProviders(<Experience />)
    expect(screen.getByTestId('vendor-summary-cards')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Experience/i })).toBeInTheDocument()
  })

  it('shows search on experiences table', () => {
    renderWithProviders(<Experience />)
    expect(screen.getByPlaceholderText(/Search by product name or type/i)).toBeInTheDocument()
    expect(screen.getByTestId('paginated-table')).toHaveAttribute('data-no-search', 'false')
  })
})

describe('Experience (branch)', () => {
  beforeEach(() => {
    mockUserType.current = 'branch'
  })

  it('hides search on My Experiences table', () => {
    renderWithProviders(<Experience />)
    expect(
      screen.queryByPlaceholderText(/Search by product name or type/i),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('paginated-table')).toHaveAttribute('data-no-search', 'true')
  })
})
