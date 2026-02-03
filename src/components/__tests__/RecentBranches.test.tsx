import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { RecentBranches } from '@/features/dashboard/components/vendors/RecentBranches'

describe('RecentBranches', () => {
  it('renders Branches title', () => {
    const { getByRole } = renderWithProviders(
      <RecentBranches branches={[]} isLoading={false} addAccountParam={(path) => path} />,
    )
    expect(getByRole('heading', { name: /branches/i })).toBeInTheDocument()
  })

  it('shows empty state when no branches', () => {
    const { getByText } = renderWithProviders(
      <RecentBranches branches={[]} isLoading={false} addAccountParam={(path) => path} />,
    )
    expect(getByText(/no branches added yet/i)).toBeInTheDocument()
  })

  it('renders branch names when branches provided', () => {
    const branches = [
      {
        id: '1',
        branch_name: 'Main Branch',
        branch_location: 'Accra',
        status: 'approved',
      },
    ]
    const { getByText } = renderWithProviders(
      <RecentBranches branches={branches} isLoading={false} addAccountParam={(path) => path} />,
    )
    expect(getByText(/main branch/i)).toBeInTheDocument()
  })
})
