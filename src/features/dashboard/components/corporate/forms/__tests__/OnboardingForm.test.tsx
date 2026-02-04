import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import OnboardingForm from '../OnboardingForm'

const mockRegister = vi.fn(() => ({}))
const mockHandleSubmit = vi.fn((fn) => (e: React.FormEvent) => {
  e.preventDefault()
  fn({})
})
const mockFormState = { errors: {} }

vi.mock('../hooks/useOnboardingForm', () => ({
  useOnboardingForm: () => ({
    form: {
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      formState: mockFormState,
    },
    frontOfIdentification: null,
    backOfIdentification: null,
    showSuccessModal: false,
    setShowSuccessModal: vi.fn(),
    isPassport: false,
    isNationalId: true,
    needsOnlyFront: false,
    isPending: false,
    isLoading: false,
    isFetchingPresignedURL: false,
    userProfileData: null,
    onSubmit: vi.fn(),
    handleSuccessContinue: vi.fn(),
    handleDiscard: vi.fn(),
    dobMaxDate: '2020-01-01',
    submitButtonLabel: 'Submit',
  }),
}))

describe('OnboardingForm (corporate)', () => {
  it('renders Key Person Details heading', () => {
    renderWithProviders(<OnboardingForm />)
    expect(screen.getByText('Key Person Details')).toBeInTheDocument()
    expect(
      screen.getByText(/update your personal details and contact information/i),
    ).toBeInTheDocument()
  })

  it('renders first name, last name and date of birth inputs', () => {
    renderWithProviders(<OnboardingForm />)
    expect(screen.getByPlaceholderText(/enter your first name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your last name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your date of birth/i)).toBeInTheDocument()
  })

  it('renders street address input', () => {
    renderWithProviders(<OnboardingForm />)
    expect(screen.getByPlaceholderText(/enter your street address/i)).toBeInTheDocument()
  })
})
