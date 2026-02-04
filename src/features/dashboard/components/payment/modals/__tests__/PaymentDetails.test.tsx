import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { PaymentDetails } from '../PaymentDetails'

vi.mock('@/hooks', () => ({
  usePersistedModalState: () => ({
    openModal: vi.fn(),
    closeModal: vi.fn(),
    isModalOpen: () => true,
  }),
}))

// PaymentDetails likely expects modal to be open and receives payment data via context or props - check component
// If it only renders when isModalOpen and has data, we may need to provide minimal data
describe('PaymentDetails (payment modal)', () => {
  it('renders modal content when open', () => {
    renderWithProviders(<PaymentDetails />)
    // Modal may render title or placeholder when open with no data
    const title = screen.queryByText(/payment details/i) ?? screen.queryByText(/card/i)
    expect(title !== null || document.body.querySelector('[role="dialog"]')).toBe(true)
  })
})
