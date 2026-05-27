import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { FeaturedCards } from '../FeaturedCards'

vi.mock('../../hooks/website', () => ({
  useFeaturedCards: () => ({
    sections: [
      { id: 'dashx', label: 'DashX', cards: [] },
      { id: 'dashpass', label: 'DashPass', cards: [] },
    ],
    isLoading: false,
  }),
}))

describe('FeaturedCards', () => {
  it('renders separate DashX and DashPass sections', () => {
    renderWithProviders(<FeaturedCards />)
    expect(screen.getByText('DashX')).toBeInTheDocument()
    expect(screen.getByText('DashPass')).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('renders All link for each section', () => {
    renderWithProviders(<FeaturedCards />)
    expect(screen.getAllByRole('button', { name: /All/i })).toHaveLength(2)
  })
})
