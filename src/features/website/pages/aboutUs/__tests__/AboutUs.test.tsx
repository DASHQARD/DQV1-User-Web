import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import AboutUs from '../AboutUs'

vi.mock('@/assets/svgs/dashpro_bg.svg', () => ({ default: '/dashpro-bg.svg' }))

describe('AboutUs (website)', () => {
  it('renders About Us badge', () => {
    renderWithProviders(<AboutUs />)
    expect(screen.getByText('About Us')).toBeInTheDocument()
  })

  it('renders main heading', () => {
    renderWithProviders(<AboutUs />)
    expect(screen.getByText('Transforming Digital Gifting in Ghana')).toBeInTheDocument()
  })

  it('renders stats: Happy Customers, Gift Cards Sent, Uptime', () => {
    renderWithProviders(<AboutUs />)
    expect(screen.getByText('1K+')).toBeInTheDocument()
    expect(screen.getByText('2.6K+')).toBeInTheDocument()
    expect(screen.getByText('99.9%')).toBeInTheDocument()
    expect(screen.getByText('Happy Customers')).toBeInTheDocument()
    expect(screen.getByText('Gift Cards Sent')).toBeInTheDocument()
    expect(screen.getByText('Uptime')).toBeInTheDocument()
  })
})
