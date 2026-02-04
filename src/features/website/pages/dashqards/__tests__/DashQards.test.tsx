import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import DashQards from '../DashQards'

vi.mock('@/assets/images/DashX.png', () => ({ default: '/dashx.png' }))
vi.mock('@/assets/images/DashGo.png', () => ({ default: '/dashgo.png' }))
vi.mock('@/assets/images/DashPro.png', () => ({ default: '/dashpro.png' }))

vi.mock('../../hooks/website', () => ({
  usePublicCatalog: () => ({
    publicCards: [],
    query: {},
    setQuery: vi.fn(),
    cardTabs: [
      { id: 'dashx', label: 'DashX' },
      { id: 'dashpro', label: 'DashPro' },
      { id: 'dashpass', label: 'DashPass' },
      { id: 'dashgo', label: 'DashGo' },
    ],
    priceRanges: [],
  }),
}))
vi.mock('../../hooks/website/usePublicCatalogQueries', () => ({
  usePublicCatalogQueries: () => ({
    usePublicVendorsService: () => ({ data: [] }),
  }),
}))
vi.mock('../../components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../components')>()
  return {
    ...actual,
    CardItems: () => <div data-testid="card-items">CardItems</div>,
    DashProPurchase: () => <div data-testid="dashpro-purchase">DashProPurchase</div>,
    DashGoPurchase: () => <div data-testid="dashgo-purchase">DashGoPurchase</div>,
  }
})

describe('DashQards (website)', () => {
  it('renders hero heading', () => {
    renderWithProviders(<DashQards />)
    expect(screen.getByText('Give the Gift of Choice')).toBeInTheDocument()
  })

  it('renders Filter Results and Card Selection', () => {
    renderWithProviders(<DashQards />)
    expect(screen.getByText('Filter Results')).toBeInTheDocument()
    expect(screen.getByText('Card Selection')).toBeInTheDocument()
  })
})
