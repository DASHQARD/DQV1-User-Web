import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import { InviteAdmin } from '../invite/InviteAdmin'

const mockMutate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  }
})

vi.mock('@/hooks', () => ({
  useUserProfile: () => ({
    useGetUserProfileService: () => ({ data: { vendor_id: 100 } }),
  }),
}))

vi.mock('@/features/dashboard/corporate/hooks', () => ({
  corporateMutations: () => ({
    useInviteVendorAdminService: () => ({ mutate: mockMutate, isPending: false }),
  }),
}))

describe('InviteAdmin (vendor)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form fields and buttons', () => {
    renderWithProviders(<InviteAdmin />)
    expect(screen.getByPlaceholderText(/enter first name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter last name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter email address/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send invitation/i })).toBeInTheDocument()
  })

  it('submit button is enabled when vendor_id is available', () => {
    renderWithProviders(<InviteAdmin />)
    expect(screen.getByRole('button', { name: /send invitation/i })).not.toBeDisabled()
  })

  it('calls mutate on submit with form data', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InviteAdmin />)
    await user.type(screen.getByPlaceholderText(/enter first name/i), 'Jane')
    await user.type(screen.getByPlaceholderText(/enter last name/i), 'Doe')
    await user.type(screen.getByPlaceholderText(/enter email address/i), 'jane@example.com')
    await user.click(screen.getByRole('button', { name: /send invitation/i }))
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        vendorId: '100',
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com',
        role: 'admin',
      }),
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
  })

  it('Clear button resets form', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InviteAdmin />)
    await user.type(screen.getByPlaceholderText(/enter first name/i), 'Test')
    await user.click(screen.getByRole('button', { name: /clear/i }))
    expect(screen.getByPlaceholderText(/enter first name/i)).toHaveValue('')
  })
})
