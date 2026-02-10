import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import OtpLoginModal from '../OtpLoginModal'

const mockGoToLogin = vi.fn()
const mockVerifyOtp = vi.fn()
const mockResendOtp = vi.fn()

vi.mock('../../hooks', () => ({
  useOtpLoginModal: () => ({
    form: {
      handleSubmit: (fn: () => void) => (e: React.FormEvent) => {
        e.preventDefault()
        fn()
      },
      control: {},
      formState: { isValid: true },
    },
    onSubmit: vi.fn(),
    isPending: false,
    verifyOtp: mockVerifyOtp,
    resendOtp: mockResendOtp,
    formatCountdown: () => '00:00',
    countdown: 0,
    goToLogin: mockGoToLogin,
  }),
}))

describe('OtpLoginModal', () => {
  it('renders OTP verification heading', () => {
    renderWithProviders(<OtpLoginModal />)
    expect(screen.getByText('OTP verification')).toBeInTheDocument()
  })

  it('renders Verify & Continue button', () => {
    renderWithProviders(<OtpLoginModal />)
    expect(screen.getByRole('button', { name: /Verify & Continue/i })).toBeInTheDocument()
  })
})
