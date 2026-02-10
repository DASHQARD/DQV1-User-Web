import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import MyCards from '../my-cards/MyCards'

vi.mock('@/features/dashboard/hooks/useCards', () => ({
  useGiftCardMetrics: () => ({
    data: { DashX: 0, DashGo: 0, DashPass: 0, DashPro: 0 },
    isLoading: false,
  }),
}))

vi.mock('@/assets/svgs/Dashx_bg.svg', () => ({ default: '/dashx-bg.svg' }))
vi.mock('@/assets/svgs/dashgo_bg.svg', () => ({ default: '/dashgo-bg.svg' }))
vi.mock('@/assets/svgs/dashpro_bg.svg', () => ({ default: '/dashpro-bg.svg' }))
vi.mock('@/assets/images/dashpass_bg.png', () => ({ default: '/dashpass-bg.png' }))

describe('MyCards (user)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders My Cards title', () => {
    const { getByText } = renderWithProviders(<MyCards />)
    expect(getByText('My Cards')).toBeInTheDocument()
  })

  it('renders view your purchased gift cards description', () => {
    const { getByText } = renderWithProviders(<MyCards />)
    expect(getByText('View your purchased gift cards')).toBeInTheDocument()
  })

  it('renders empty state when no cards', () => {
    const { getByText } = renderWithProviders(<MyCards />)
    expect(getByText('No cards purchased yet')).toBeInTheDocument()
  })
})
