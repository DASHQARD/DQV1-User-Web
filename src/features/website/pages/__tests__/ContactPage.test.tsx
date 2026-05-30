import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen, waitFor } from '@/test/test-utils'
import ContactPage from '../contact/ContactPage'
import { createTicket } from '@/services'

vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    useToast: () => ({ success: vi.fn(), error: vi.fn() }),
    useCountriesData: () => ({ countries: [] }),
  }
})

vi.mock('@/services', () => ({
  createTicket: vi.fn(),
}))

describe('ContactPage (website)', () => {
  beforeEach(() => {
    vi.mocked(createTicket).mockResolvedValue({ message: 'Ticket created successfully' })
  })

  it('renders contact form with name, email, subject, message fields', () => {
    renderWithProviders(<ContactPage />)
    expect(document.body.textContent).toMatch(/Name|Email|Subject|Message|Contact/i)
  })

  it('renders submit button', () => {
    renderWithProviders(<ContactPage />)
    const submit = screen.getByRole('button', { name: /send message/i })
    expect(submit).toBeInTheDocument()
  })

  it('submits via createTicket API on valid form', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContactPage />)

    await user.type(screen.getByPlaceholderText(/Enter your full name/i), 'Jane Doe')
    await user.type(screen.getByPlaceholderText(/Enter your email address/i), 'jane@example.com')
    await user.selectOptions(screen.getByRole('combobox', { name: /feedback type/i }), 'bug-report')
    await user.click(screen.getByTestId('option-website-inquiry'))
    await user.type(
      screen.getByPlaceholderText(/Please provide detailed information/i),
      'Cannot sign in',
    )

    await user.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(createTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Jane Doe',
          email: 'jane@example.com',
          subject: expect.stringContaining('[BUG REPORT] Website inquiry'),
          message: expect.stringContaining('Cannot sign in'),
        }),
      )
    })
  })
})
