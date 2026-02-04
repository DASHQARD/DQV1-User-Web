import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import BranchGiftCards from '../BranchGiftCards'

vi.mock('@/features/dashboard/components/vendors/cards/Cards', () => ({
  default: ({ title, value }: { title: string; value: string }) => (
    <div data-testid="vendor-card">
      <span data-testid="card-title">{title}</span>
      <span data-testid="card-value">{value}</span>
    </div>
  ),
}))

vi.mock('@/assets/images/ajo-savings.png', () => ({ default: '/mock-ajo.png' }))
vi.mock('@/assets/images/group-savings.png', () => ({ default: '/mock-group.png' }))
vi.mock('@/assets/images/individual-savings.png', () => ({ default: '/mock-individual.png' }))
vi.mock('@/assets/images/wallet-illustration.png', () => ({ default: '/mock-wallet.png' }))

describe('BranchGiftCards', () => {
  it('renders four redemption cards with provided values', () => {
    renderWithProviders(
      <BranchGiftCards
        dashx_redemptions="100"
        dashpro_redemptions="200"
        dashgo_redemptions="50"
        dashpass_redemptions="75"
      />,
    )
    const cards = screen.getAllByTestId('vendor-card')
    expect(cards).toHaveLength(4)
    expect(screen.getByText('DashX Redemptions')).toBeInTheDocument()
    expect(screen.getByText('DashPro Redemptions')).toBeInTheDocument()
    expect(screen.getByText('DashGo Redemptions')).toBeInTheDocument()
    expect(screen.getByText('DashPass Redemptions')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('75')).toBeInTheDocument()
  })

  it('uses default ₦0 when a value is undefined', () => {
    renderWithProviders(
      <BranchGiftCards
        dashx_redemptions={undefined as unknown as string}
        dashpro_redemptions=""
        dashgo_redemptions={undefined as unknown as string}
        dashpass_redemptions={undefined as unknown as string}
      />,
    )
    const values = screen.getAllByTestId('card-value')
    expect(values.map((el) => el.textContent)).toContain('₦0')
  })
})
