import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { ViewAdminDetails } from '../ViewAdminDetails'

vi.mock('@/hooks', () => ({
  usePersistedModalState: () => ({
    openModal: vi.fn(),
    closeModal: vi.fn(),
    isModalOpen: () => true,
    modalData: {
      status: 'active',
      admin_status: 'active',
      admin_fullname: 'Jane Doe',
      admin_email: 'jane@example.com',
      phone_number: '+1234567890',
      corporate_name: 'Acme',
      corporate_business_name: 'Acme Inc',
      corporate_email: 'corp@acme.com',
      invited_by_name: 'Admin',
      invited_by_email: 'admin@acme.com',
      invitation_id: 1,
      created_at: '2024-01-01',
      updated_at: '2024-01-02',
    },
  }),
}))

describe('ViewAdminDetails (corporate modal)', () => {
  it('renders Admin details modal title when open', () => {
    renderWithProviders(<ViewAdminDetails />)
    expect(screen.getByText('Admin details')).toBeInTheDocument()
  })

  it('renders admin info labels when modal has data', () => {
    renderWithProviders(<ViewAdminDetails />)
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Full Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('renders Close button', () => {
    renderWithProviders(<ViewAdminDetails />)
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })
})
