import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import PaymentInfo from '../payment/PaymentInfo'

vi.mock('@/hooks', () => {
  const stableUser = {}
  return {
    useUserProfile: () => ({
      useGetUserProfileService: () => ({ data: stableUser }),
    }),
  }
})

vi.mock('@/features/dashboard/components', () => ({
  PaymentInfoForm: () => <div data-testid="payment-info-form">Payment form</div>,
}))

describe('PaymentInfo (vendor)', () => {
  it('renders Payment Methods heading', () => {
    renderWithProviders(<PaymentInfo />)
    expect(screen.getByRole('heading', { name: 'Payment Methods' })).toBeInTheDocument()
  })

  it('renders PaymentInfoForm', () => {
    renderWithProviders(<PaymentInfo />)
    expect(screen.getByTestId('payment-info-form')).toBeInTheDocument()
  })
})
