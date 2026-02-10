import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import CreateBranch from '../CreateBranch'

vi.mock('@/hooks', () => ({
  useUserProfile: () => ({
    useGetUserProfileService: () => ({
      data: { vendor_id: 1 },
    }),
  }),
}))

vi.mock('@/features/dashboard/components/corporate/forms', () => ({
  CreateBranchForm: () => <div data-testid="create-branch-form">CreateBranchForm</div>,
}))

describe('CreateBranch (vendor branches)', () => {
  it('renders Create Branch heading', () => {
    renderWithProviders(<CreateBranch />)
    expect(screen.getByText('Create Branch')).toBeInTheDocument()
  })

  it('renders Add New Branch section title', () => {
    renderWithProviders(<CreateBranch />)
    expect(screen.getByText('Add New Branch')).toBeInTheDocument()
  })

  it('renders description about adding a new branch', () => {
    renderWithProviders(<CreateBranch />)
    expect(
      screen.getByText(
        /Add a new branch to your vendor account. Fill in the branch details and manager information./i,
      ),
    ).toBeInTheDocument()
  })

  it('renders CreateBranchForm', () => {
    renderWithProviders(<CreateBranch />)
    expect(screen.getByTestId('create-branch-form')).toBeInTheDocument()
    expect(screen.getByText('CreateBranchForm')).toBeInTheDocument()
  })
})
