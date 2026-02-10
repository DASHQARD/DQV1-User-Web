import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import CorporateAdmins from '../Admins'

vi.mock('@/features/dashboard/hooks', () => ({
  useCorporateAdmins: () => ({
    corporateAdminTabConfigs: [
      {
        key: 'all-admins' as const,
        component: () => React.createElement('div', null, 'All admins tab'),
        label: 'All admins',
      },
      {
        key: 'invited-admins' as const,
        component: () => React.createElement('div', null, 'Invited admins tab'),
        label: 'Invited admins',
      },
    ],
  }),
}))

vi.mock('../../../components/corporate/modals/InviteAdmin', () => ({
  InviteAdmin: () => <button type="button">Invite Admin</button>,
}))

describe('Admins (corporate)', () => {
  it('renders Admins heading', () => {
    renderWithProviders(<CorporateAdmins />)
    expect(screen.getByText('Admins')).toBeInTheDocument()
  })

  it('renders Invite Admin button', () => {
    renderWithProviders(<CorporateAdmins />)
    expect(screen.getByRole('button', { name: /invite admin/i })).toBeInTheDocument()
  })

  it('renders All admins and Invited admins tabs', () => {
    renderWithProviders(<CorporateAdmins />)
    expect(screen.getByRole('button', { name: /all admins/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /invited admins/i })).toBeInTheDocument()
  })

  it('renders default tab content', () => {
    renderWithProviders(<CorporateAdmins />)
    expect(screen.getByText('All admins tab')).toBeInTheDocument()
  })
})
