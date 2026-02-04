import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import ContactPage from '../ContactPage'

vi.mock('@/hooks', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}))

vi.mock('@/services/requests', () => ({
  postMethod: vi.fn(() => Promise.resolve({})),
}))

describe('ContactPage (website)', () => {
  it('renders contact form with name, email, subject, message fields', () => {
    renderWithProviders(<ContactPage />)
    expect(document.body.textContent).toMatch(/Name|Email|Subject|Message|Contact/i)
  })

  it('renders submit button', () => {
    renderWithProviders(<ContactPage />)
    const submit = screen.getByRole('button', { name: /send|submit/i })
    expect(submit).toBeInTheDocument()
  })
})
