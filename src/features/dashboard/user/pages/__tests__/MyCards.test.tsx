import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import MyCards from '../my-cards/MyCards'

const { mockUseGiftCardMetrics } = vi.hoisted(() => ({
  mockUseGiftCardMetrics: vi.fn().mockReturnValue({
    data: { data: { DashX: 0, DashGo: 0, DashPass: 0, DashPro: 0 } },
    isLoading: false,
  }),
}))

vi.mock('@/features/dashboard/hooks/useCards', () => ({
  useGiftCardMetrics: mockUseGiftCardMetrics,
}))

describe('MyCards (user)', () => {
  beforeEach(() => {
    mockUseGiftCardMetrics.mockReturnValue({
      data: { data: { DashX: 0, DashGo: 0, DashPass: 0, DashPro: 0 } },
      isLoading: false,
    })
  })

  it('renders My Cards title', () => {
    renderWithProviders(<MyCards />)
    expect(screen.getByText('My Cards')).toBeInTheDocument()
  })

  it('renders view your purchased gift cards description', () => {
    renderWithProviders(<MyCards />)
    expect(screen.getByText('View your purchased gift cards')).toBeInTheDocument()
  })

  it('renders dashboard-style gift card tiles', () => {
    renderWithProviders(<MyCards />)
    expect(screen.getByText('DashX')).toBeInTheDocument()
    expect(screen.getByText('DashGo')).toBeInTheDocument()
    expect(screen.getByText('DashPro')).toBeInTheDocument()
    expect(screen.getByText('DashPass')).toBeInTheDocument()
  })

  it('shows DashPro as formatted balance not card count', () => {
    mockUseGiftCardMetrics.mockReturnValue({
      data: { data: { DashX: 0, DashGo: 0, DashPass: 0, DashPro: 1000 } },
      isLoading: false,
    })
    renderWithProviders(<MyCards />)
    expect(screen.getByText('GHS 1,000.00')).toBeInTheDocument()
    expect(screen.queryByText(/1000 cards/i)).not.toBeInTheDocument()
  })
})
