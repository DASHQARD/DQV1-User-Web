import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import Contact from '../ContactUs/Contact'

vi.mock('@/hooks', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}))

vi.mock('@/services', () => ({
  createTicket: vi.fn().mockResolvedValue({ message: 'Success' }),
}))

describe('ContactUs (Contact)', () => {
  it('renders Contact Us heading', () => {
    renderWithProviders(<Contact />)
    expect(screen.getByText('Contact Us')).toBeInTheDocument()
  })

  it('renders Get In Touch badge', () => {
    renderWithProviders(<Contact />)
    expect(screen.getByText(/Get In Touch/i)).toBeInTheDocument()
  })

  it('renders name, email, subject and message inputs', () => {
    renderWithProviders(<Contact />)
    expect(screen.getByPlaceholderText(/Enter your name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter your subject/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Tell us more about your inquiry/i)).toBeInTheDocument()
  })
})
