import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import CorporateCardDetailsPage from '../cards/CardDetailsPage'

vi.mock('../cards/useCorporateCardDetailsPage', () => ({
  useCorporateCardDetailsPage: () => ({
    cardType: 'dashx',
    validCardType: 'dashx',
    navigate: vi.fn(),
    addAccountParam: (path: string) => path,
    user: {},
    isLoading: false,
    filteredCards: [],
    pagination: { hasNextPage: false, hasPreviousPage: false },
    paginationLimit: 10,
    handleNextPage: vi.fn(),
    handlePreviousPage: vi.fn(),
    handlePageSizeChange: vi.fn(),
    getCardBackground: vi.fn(),
    CARD_DISPLAY_NAMES: { dashx: 'DashX', dashgo: 'DashGo', dashpro: 'DashPro', dashpass: 'DashPass' },
    cardImageUrls: {},
    handleRedeemClick: vi.fn(),
    showVendorModal: false,
    handleCloseVendorModal: vi.fn(),
    selectedCard: null,
    vendorOptions: [],
    selectedVendorId: null,
    handleVendorSelect: vi.fn(),
    isLoadingVendors: false,
    selectedVendor: null,
    clearVendorSelection: vi.fn(),
    availableBranches: [],
    branchOptions: [],
    selectedBranchId: null,
    setSelectedBranchIdFromValue: vi.fn(),
    handleConfirmVendor: vi.fn(),
    canConfirmVendor: false,
    showRedemptionModal: false,
    handleCloseRedemptionModal: vi.fn(),
    agreeToTerms: false,
    setAgreeToTerms: vi.fn(),
    handleConfirmRedemption: vi.fn(),
    isProcessingRedemption: false,
    branchNameForSummary: null,
  }),
}))

describe('CorporateCardDetailsPage (corporate)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders DashX Gift Cards title when valid card type', () => {
    const { getAllByText } = renderWithProviders(<CorporateCardDetailsPage />, {
      initialEntries: ['/dashboard/corporate/gift-cards/dashx'],
    })
    expect(getAllByText(/DashX Gift Cards/i).length).toBeGreaterThan(0)
  })

  it('renders Back to Dashboard link', () => {
    const { getByText } = renderWithProviders(<CorporateCardDetailsPage />, {
      initialEntries: ['/dashboard/corporate/gift-cards/dashx'],
    })
    expect(getByText('Back to Dashboard')).toBeInTheDocument()
  })
})
