import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import AcceptVendorInvite from '../acceptVendorInvite/AcceptVendorInvite'

describe('AcceptVendorInvite page', () => {
  it('renders the set password form with heading', () => {
    const { getByRole } = renderWithProviders(<AcceptVendorInvite />)

    expect(getByRole('heading', { name: /set your password/i })).toBeInTheDocument()
  })

  it('renders password and confirm password inputs', () => {
    const { getAllByPlaceholderText } = renderWithProviders(<AcceptVendorInvite />)

    const passwordInputs = getAllByPlaceholderText(/enter your password/i)
    expect(passwordInputs).toHaveLength(2)
  })

  it('renders accept invitation button', () => {
    const { getByRole } = renderWithProviders(<AcceptVendorInvite />)

    expect(getByRole('button', { name: /accept invitation/i })).toBeInTheDocument()
  })
})
