import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import Footer from '../Footer/Footer'

describe('Footer', () => {
  it('renders logo and tagline', () => {
    renderWithProviders(<Footer />)
    expect(screen.getByAltText('Logo')).toBeInTheDocument()
    expect(screen.getByText('Create, Connect. Celebrate.')).toBeInTheDocument()
    expect(screen.getByText(/Redefining the gifting experience across Ghana/i)).toBeInTheDocument()
  })

  it('renders Follow Us section with social links', () => {
    renderWithProviders(<Footer />)
    expect(screen.getByText('Follow Us')).toBeInTheDocument()
    const socialLinks = screen.getAllByRole('link', { name: /visit our/i })
    expect(socialLinks.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Quick Links section', () => {
    renderWithProviders(<Footer />)
    expect(screen.getByText('Quick Links')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'About Us' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contact Us' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Get Started' })).toBeInTheDocument()
  })

  it('renders Services section', () => {
    renderWithProviders(<Footer />)
    expect(screen.getByText('Services')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Gift Cards' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Vendors' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Redeem' })).toBeInTheDocument()
  })

  it('renders Get in Touch with contact details', () => {
    renderWithProviders(<Footer />)
    expect(screen.getByText('Get in Touch')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('support@dashqard.com')).toBeInTheDocument()
    expect(screen.getByText('Support Line')).toBeInTheDocument()
    expect(screen.getByText('+233 54 202 2245')).toBeInTheDocument()
    expect(screen.getByText('Purchase Line (WhatsApp)')).toBeInTheDocument()
  })

  it('renders copyright and Terms of Service', () => {
    renderWithProviders(<Footer />)
    const year = new Date().getFullYear()
    expect(
      screen.getByText(new RegExp(`${year} DashQard. All rights reserved.`)),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toBeInTheDocument()
  })
})
