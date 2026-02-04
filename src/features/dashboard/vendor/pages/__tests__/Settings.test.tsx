import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import Settings from '../settings/Settings'

vi.mock('../settings/BusinessDetailsSettings', () => ({
  BusinessDetailsSettings: () => (
    <div data-testid="business-details-settings">Business Details</div>
  ),
}))

vi.mock('../settings/BusinessLogoSettings', () => ({
  BusinessLogoSettings: () => <div data-testid="business-logo-settings">Business Logo</div>,
}))

describe('Settings (vendor)', () => {
  it('renders Settings heading', () => {
    renderWithProviders(<Settings />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders description about managing business information', () => {
    renderWithProviders(<Settings />)
    expect(
      screen.getByText(/manage your business information and payment methods/i),
    ).toBeInTheDocument()
  })

  it('renders Business Details and Business Logo tabs', () => {
    renderWithProviders(<Settings />)
    expect(screen.getByRole('button', { name: /business details/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /business logo/i })).toBeInTheDocument()
  })

  it('renders Business Details content by default', () => {
    renderWithProviders(<Settings />)
    expect(screen.getByTestId('business-details-settings')).toBeInTheDocument()
  })
})
