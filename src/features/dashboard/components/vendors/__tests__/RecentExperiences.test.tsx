import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { RecentExperiences } from '../RecentExperiences'

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

  it('renders experience count in header when experiences exist', () => {
    renderWithProviders(
      <RecentExperiences
        experiences={[{ id: 1, product: 'Gift Card', type: 'dashx', status: 'approved' }]}
        isLoading={false}
        addAccountParam={addAccountParam}
      />,
    )
    expect(screen.getByText('(1)')).toBeInTheDocument()
    expect(screen.getByText('Gift Card')).toBeInTheDocument()
    expect(screen.getByText('dashx')).toBeInTheDocument()
    expect(screen.getByText('approved')).toBeInTheDocument()
  })

  it('shows View all N experiences when more than 5', () => {
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
    expect(screen.getByRole('link', { name: /view all 7 experiences/i })).toBeInTheDocument()
  })
})
