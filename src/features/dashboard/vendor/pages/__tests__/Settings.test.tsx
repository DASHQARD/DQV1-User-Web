import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import Settings from '../settings/Settings'

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

  it('renders Business Details tab', () => {
    renderWithProviders(<Settings />)
    expect(screen.getByRole('button', { name: /business details/i })).toBeInTheDocument()
  })

  it('renders business details view or empty state', () => {
    renderWithProviders(<Settings />)
    const hasEmpty = screen.queryByText(/no business details available/i)
    const hasRequest = screen.queryByText(/request to update business information/i)
    expect(hasEmpty || hasRequest).toBeTruthy()
  })
})
