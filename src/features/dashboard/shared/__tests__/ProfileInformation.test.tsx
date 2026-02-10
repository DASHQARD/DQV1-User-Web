import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import ProfileInformation from '../ProfileInformation'

vi.mock('@/features/auth', () => ({
  OnboardingForm: () => <div data-testid="onboarding-form">OnboardingForm</div>,
}))

describe('ProfileInformation (dashboard shared)', () => {
  it('renders breadcrumb with Compliance and Profile Information', () => {
    renderWithProviders(<ProfileInformation />)
    expect(screen.getByRole('link', { name: /compliance/i })).toBeInTheDocument()
    expect(screen.getByText('Profile Information')).toBeInTheDocument()
  })

  it('renders OnboardingForm', () => {
    renderWithProviders(<ProfileInformation />)
    expect(screen.getByTestId('onboarding-form')).toBeInTheDocument()
  })
})
