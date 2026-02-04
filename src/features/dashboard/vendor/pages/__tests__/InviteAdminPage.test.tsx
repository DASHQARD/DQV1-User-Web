import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import InviteAdminPage from '../admin/InviteAdminPage'

vi.mock('@/hooks', () => ({
  useUserProfile: () => ({
    useGetUserProfileService: () => ({ data: { vendor_id: 1 } }),
  }),
}))

vi.mock('@/features/dashboard/corporate/hooks', () => ({
  corporateMutations: () => ({
    useInviteVendorAdminService: () => ({ mutate: vi.fn(), isPending: false }),
  }),
}))

describe('InviteAdminPage (vendor)', () => {
  it('renders Invite Admin heading', () => {
    renderWithProviders(<InviteAdminPage />)
    expect(screen.getByText('Invite Admin')).toBeInTheDocument()
  })

  it('renders description about sending invitation', () => {
    renderWithProviders(<InviteAdminPage />)
    expect(screen.getByText(/send an invitation to a new admin/i)).toBeInTheDocument()
  })

  it('renders invite form with first name, last name and email fields', () => {
    renderWithProviders(<InviteAdminPage />)
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
  })

  it('renders Clear and Send Invitation buttons', () => {
    renderWithProviders(<InviteAdminPage />)
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send invitation/i })).toBeInTheDocument()
  })
})
