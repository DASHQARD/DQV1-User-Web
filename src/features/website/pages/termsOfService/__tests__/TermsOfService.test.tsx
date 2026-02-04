import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import TermsOfService from '../TermsOfService'

describe('TermsOfService (website)', () => {
  it('renders Terms of Service heading', () => {
    renderWithProviders(<TermsOfService />)
    expect(
      screen.getByText(/Terms of Use & Conditions of Service/i),
    ).toBeInTheDocument()
  })

  it('renders content section', () => {
    renderWithProviders(<TermsOfService />)
    expect(document.body.textContent).toMatch(/Terms|Services|DashQard/i)
  })
})
