import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { BusinessDetailsSettings } from '../BusinessDetailsSettings'

let mockBusiness: Record<string, unknown> | null = null
vi.mock('@/features/dashboard/hooks', () => ({
  useBusinessDetailsSettings: () => ({
    get business() {
      return mockBusiness
    },
    logoUrl: null,
    businessTypeLabel: mockBusiness ? 'Retail' : null,
    openRequestModal: vi.fn(),
  }),
}))

vi.mock('@/features/dashboard/components/corporate/modals', () => ({
  RequestBusinessUpdateModal: () => (
    <div data-testid="request-business-update-modal">RequestBusinessUpdateModal</div>
  ),
}))

describe('BusinessDetailsSettings (dashboard shared)', () => {
  beforeEach(() => {
    mockBusiness = null
  })

  it('renders No business details when business is null', () => {
    renderWithProviders(<BusinessDetailsSettings />)
    expect(screen.getByText('No business details available.')).toBeInTheDocument()
  })

  it('renders business details and Request update when business is set', () => {
    mockBusiness = {
      name: 'Acme Inc',
      type: 'retail',
      phone: '+233 24 123 4567',
      email: 'acme@example.com',
      street_address: '123 Main St',
      digital_address: 'GA-123-4567',
      registration_number: 'REG123',
    }
    renderWithProviders(<BusinessDetailsSettings />)
    expect(screen.getByText('Business details')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /request update/i })).toBeInTheDocument()
    expect(screen.getByText('Acme Inc')).toBeInTheDocument()
  })
})
