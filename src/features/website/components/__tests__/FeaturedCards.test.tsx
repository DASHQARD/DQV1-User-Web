import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { FeaturedCards } from '../FeaturedCards'

vi.mock('../../hooks/website', () => ({
  useFeaturedCards: () => ({
    activeTab: 'dashx',
    setActiveTab: vi.fn(),
    tabOptions: [
      { value: 'dashx', label: 'DashX' },
      { value: 'dashpass', label: 'DashPass' },
    ],
    filteredCards: [],
    isLoading: false,
  }),
}))

describe('FeaturedCards', () => {
  it('renders Featured Cards heading', () => {
    renderWithProviders(<FeaturedCards />)
    expect(screen.getByText('Featured Cards')).toBeInTheDocument()
  })

  it('renders See more button', () => {
    renderWithProviders(<FeaturedCards />)
    expect(screen.getByRole('button', { name: /See more/i })).toBeInTheDocument()
  })

  it('renders tab options', () => {
    renderWithProviders(<FeaturedCards />)
    expect(screen.getByText('DashX')).toBeInTheDocument()
    expect(screen.getByText('DashPass')).toBeInTheDocument()
  })
})
