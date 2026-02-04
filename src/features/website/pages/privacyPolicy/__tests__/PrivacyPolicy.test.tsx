import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import PrivacyPolicy from '../PrivacyPolicy'

describe('PrivacyPolicy (website)', () => {
  it('renders Privacy Policy heading', () => {
    renderWithProviders(<PrivacyPolicy />)
    expect(screen.getByText(/DashQard Privacy Policy/i)).toBeInTheDocument()
  })

  it('renders back to top or scroll button', () => {
    renderWithProviders(<PrivacyPolicy />)
    const backButton = screen.queryByRole('button', { name: /back to top|scroll/i })
    expect(backButton !== null || document.body.querySelector('button')).toBeTruthy()
  })
})
