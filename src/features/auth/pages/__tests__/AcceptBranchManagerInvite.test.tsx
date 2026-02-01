import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import AcceptBranchManagerInvite from '../acceptBranchManagerInvite/AcceptBranchManagerInvite'

describe('AcceptBranchManagerInvite page', () => {
  it('without token shows invalid invitation message', () => {
    const { getByText } = renderWithProviders(<AcceptBranchManagerInvite />, {
      initialEntries: ['/invite/branch'],
    })

    expect(getByText(/invalid invitation/i)).toBeInTheDocument()
    expect(getByText(/invalid or has expired/i)).toBeInTheDocument()
  })

  it('with token renders the accept invitation form with heading', () => {
    const { getByRole } = renderWithProviders(<AcceptBranchManagerInvite />, {
      initialEntries: ['/invite/branch?token=valid-token'],
    })

    expect(getByRole('heading', { name: /accept branch manager invitation/i })).toBeInTheDocument()
  })

  it('with token renders password inputs and accept button', () => {
    const { getByPlaceholderText, getByRole } = renderWithProviders(<AcceptBranchManagerInvite />, {
      initialEntries: ['/invite/branch?token=valid-token'],
    })

    expect(getByPlaceholderText(/enter your password/i)).toBeInTheDocument()
    expect(getByPlaceholderText(/confirm your password/i)).toBeInTheDocument()
    expect(getByRole('button', { name: /accept invitation/i })).toBeInTheDocument()
  })
})
