import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import LandingPage from '../LandingPage'

vi.mock('@/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components')>()
  return {
    ...actual,
    Hero: () => <div data-testid="hero">Hero</div>,
  }
})

vi.mock('../../components', () => ({
  Contact: () => <div data-testid="contact">Contact</div>,
  FeaturedCards: () => <div data-testid="featured-cards">FeaturedCards</div>,
  PartnerVendors: () => <div data-testid="partner-vendors">PartnerVendors</div>,
}))

describe('LandingPage (website)', () => {
  it('renders Hero section', () => {
    renderWithProviders(<LandingPage />)
    expect(screen.getByTestId('hero')).toBeInTheDocument()
  })

  it('renders FeaturedCards and PartnerVendors', () => {
    renderWithProviders(<LandingPage />)
    expect(screen.getByText('Featured Cards')).toBeInTheDocument()
    expect(screen.getByText('Partner Vendors')).toBeInTheDocument()
  })

  it('renders Contact section', () => {
    renderWithProviders(<LandingPage />)
    expect(screen.getByText('Contact Us')).toBeInTheDocument()
  })
})
