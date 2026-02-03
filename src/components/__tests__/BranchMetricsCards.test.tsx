import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { BranchMetricsCards } from '@/features/dashboard/components/vendors/BranchMetricsCards'

describe('BranchMetricsCards', () => {
  it('renders Total Redemptions card', () => {
    const { getByText } = renderWithProviders(
      <BranchMetricsCards summary={null} isLoading={false} />,
    )
    expect(getByText(/total redemptions/i)).toBeInTheDocument()
  })

  it('renders Total Cards card', () => {
    const { getByText } = renderWithProviders(
      <BranchMetricsCards summary={null} isLoading={false} />,
    )
    expect(getByText(/total cards/i)).toBeInTheDocument()
  })

  it('shows summary values when not loading', () => {
    const summary = {
      total_redemptions: 10,
      total_cards: 5,
      total_redemption_amount: 100,
    }
    const { getByText } = renderWithProviders(
      <BranchMetricsCards summary={summary} isLoading={false} />,
    )
    expect(getByText('10')).toBeInTheDocument()
    expect(getByText('5')).toBeInTheDocument()
  })
})
