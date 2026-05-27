import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
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
    expect(screen.getByRole('heading', { name: /Contact Us/i })).toBeInTheDocument()
  })

  it('renders contact form fields when message panel is opened', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Contact />)
    await user.click(screen.getByRole('button', { name: /Send us a message/i }))
    expect(screen.getAllByPlaceholderText(/Your name/i).length).toBeGreaterThan(0)
    expect(screen.getAllByPlaceholderText(/Your email/i).length).toBeGreaterThan(0)
    expect(screen.getAllByPlaceholderText(/Your message/i).length).toBeGreaterThan(0)
  })
})
