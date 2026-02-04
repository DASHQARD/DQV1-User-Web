import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import SummaryCards from '../SummaryCards'

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    useLocation: () => ({ pathname: '/user' }),
  }
})

vi.mock('@/hooks', () => ({
  usePersistedModalState: () => ({
    openModal: vi.fn(),
    closeModal: vi.fn(),
    isModalOpen: () => false,
  }),
}))

vi.mock('@/features/dashboard/hooks/useCards', () => ({
  useGiftCardMetrics: () => ({
    data: { DashX: 0, DashGo: 0, DashPass: 0, DashPro: 1, DashGo_balance: 0 },
    isLoading: false,
  }),
}))

describe('SummaryCards', () => {
  it('renders summary content when metrics are loaded', () => {
    renderWithProviders(<SummaryCards />)
    expect(
      screen.getByText(/DashPro/i) || screen.getByText(/DashX/i) || document.body.textContent,
    ).toBeTruthy()
  })
})
