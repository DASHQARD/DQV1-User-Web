import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { RecentExperiences } from '../RecentExperiences'

vi.mock('@/features/dashboard/hooks/useVendorOnboardingProgress', () => ({
  useVendorOnboardingProgress: () => ({
    getIsNavItemDisabled: () => false,
    isSettingsDisabled: false,
    isComplete: true,
  }),
}))

const addAccountParam = (path: string) => `${path}?account=vendor`

describe('RecentExperiences', () => {
  it('renders My Experiences title and View all link', () => {
    renderWithProviders(
      <RecentExperiences experiences={[]} isLoading={false} addAccountParam={addAccountParam} />,
    )
    expect(screen.getByText('My Experiences')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view all/i })).toBeInTheDocument()
  })

  it('shows loader when isLoading is true', () => {
    renderWithProviders(
      <RecentExperiences experiences={[]} isLoading={true} addAccountParam={addAccountParam} />,
    )
    expect(screen.getByAltText('Loading...')).toBeInTheDocument()
  })

  it('shows empty state when no experiences', () => {
    renderWithProviders(
      <RecentExperiences experiences={[]} isLoading={false} addAccountParam={addAccountParam} />,
    )
    expect(screen.getByText('No experiences created yet')).toBeInTheDocument()
    expect(
      screen.getByText('Create your first experience to start offering gift cards to customers'),
    ).toBeInTheDocument()
  })

  it('renders experience cards when experiences exist', () => {
    renderWithProviders(
      <RecentExperiences
        experiences={[{ id: 1, product: 'Gift Card', type: 'dashx', status: 'approved' }]}
        isLoading={false}
        addAccountParam={addAccountParam}
      />,
    )
    expect(screen.getByText('Gift Card')).toBeInTheDocument()
    expect(screen.getByText('DASHX')).toBeInTheDocument()
  })

  it('renders list layout without issued card codes when only card_id is present', () => {
    renderWithProviders(
      <RecentExperiences
        layout="list"
        experiences={[
          {
            id: '1',
            card_id: 'X-9688-01-01-001-000002',
            type: 'DashX',
            status: 'active',
            price: '1100',
            currency: 'GHS',
          },
        ]}
        isLoading={false}
        addAccountParam={(path) => `${path}?account=branch`}
        viewAllPath="/dashboard/branch/experience"
      />,
    )
    expect(screen.getByText('My Experiences')).toBeInTheDocument()
    expect(screen.getByText('(1)')).toBeInTheDocument()
    expect(screen.queryByText('X-9688-01-01-001-000002')).not.toBeInTheDocument()
    expect(screen.getByText('DashX')).toBeInTheDocument()
    expect(screen.getByText('GHS 1,100.00')).toBeInTheDocument()
  })

  it('shows View all link when multiple experiences exist', () => {
    const experiences = Array.from({ length: 7 }, (_, i) => ({
      id: i + 1,
      product: `Exp ${i + 1}`,
      type: 'dashx',
    }))
    renderWithProviders(
      <RecentExperiences
        experiences={experiences}
        isLoading={false}
        addAccountParam={addAccountParam}
      />,
    )
    expect(screen.getByRole('link', { name: /view all/i })).toBeInTheDocument()
    expect(screen.getByText('Exp 1')).toBeInTheDocument()
  })
})
