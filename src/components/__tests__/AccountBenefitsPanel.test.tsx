import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import { AccountBenefitsPanel } from '../AccountBenefitsPanel'
import { ACCOUNT_BENEFITS } from '../AccountBenefitsPanel/accountBenefits'
import { ROUTES } from '@/utils/constants'

describe('AccountBenefitsPanel', () => {
  it('lists all AC2 benefits in sidebar variant', () => {
    renderWithProviders(<AccountBenefitsPanel variant="sidebar" />)
    for (const benefit of ACCOUNT_BENEFITS) {
      expect(screen.getByText(benefit.title)).toBeInTheDocument()
    }
  })

  it('links create account CTA to registration', () => {
    renderWithProviders(<AccountBenefitsPanel variant="banner" showGuestCheckoutNote />)
    const cta = screen.getByRole('link', { name: /create free account/i })
    expect(cta).toHaveAttribute('href', ROUTES.IN_APP.AUTH.REGISTER)
    expect(screen.getByText(/complete this purchase as a guest/i)).toBeInTheDocument()
  })
})
