import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '@/test/test-utils'
import SignUp from '../sign_up/SignUp'
import { useSignUpForm } from '../../hooks'

vi.mock('../../hooks', () => ({
  useSignUpForm: vi.fn(),
  useAuth: () => ({
    useResendVerificationMutation: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
  }),
}))

describe('SignUp (auth)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Create account heading', () => {
    function Wrapper() {
      const form = useForm({
        defaultValues: {
          user_type: 'corporate' as const,
          email: '',
          phone_number: '',
          password: '',
          country: 'Ghana',
          country_code: '01',
        },
      })
      vi.mocked(useSignUpForm).mockReturnValue({
        form: form as any,
        onSubmit: vi.fn(),
        isPending: false,
        phoneCountries: [],
      })
      return <SignUp />
    }
    const { getByRole, getByTestId } = renderWithProviders(<Wrapper />)
    expect(getByRole('button', { name: /personal/i })).toBeInTheDocument()
    expect(getByTestId('signup-marketing')).toHaveClass('hidden')
  })
})
