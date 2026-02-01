import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import InviteCorporateAdmin from '../invitecorporateadmin/InviteCorporateAdmin'

describe('InviteCorporateAdmin page', () => {
  it('renders the set password form with heading', () => {
    const { getByRole } = renderWithProviders(<InviteCorporateAdmin />)

    expect(getByRole('heading', { name: /set your password/i })).toBeInTheDocument()
  })

  it('renders password and confirm password inputs', () => {
    const { getByPlaceholderText } = renderWithProviders(<InviteCorporateAdmin />)

    expect(getByPlaceholderText(/enter your password/i)).toBeInTheDocument()
    expect(getByPlaceholderText(/confirm your password/i)).toBeInTheDocument()
  })

  it('renders accept invitation button', () => {
    const { getByRole } = renderWithProviders(<InviteCorporateAdmin />)

    expect(getByRole('button', { name: /accept invitation/i })).toBeInTheDocument()
  })
})
