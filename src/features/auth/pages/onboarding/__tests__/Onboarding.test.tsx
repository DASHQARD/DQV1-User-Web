import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import Onboarding from '../Onboarding'

describe('Onboarding', () => {
  it('renders onboarding layout', () => {
    renderWithProviders(<Onboarding />)
    expect(document.querySelector('.min-h-screen')).toBeInTheDocument()
  })

  it('renders OnboardingForm', () => {
    renderWithProviders(<Onboarding />)
    expect(document.querySelector('.flex-1')).toBeInTheDocument()
  })
})
