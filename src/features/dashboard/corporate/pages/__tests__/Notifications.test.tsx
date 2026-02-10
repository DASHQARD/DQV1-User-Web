import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import Notifications from '../notifications/Notifications'

vi.mock('@/features/dashboard/hooks/useNotifications', () => ({
  useApprovePaymentChange: () => ({ mutate: vi.fn(), isPending: false }),
  useRejectPaymentChange: () => ({ mutate: vi.fn(), isPending: false }),
}))
vi.mock('@/features/dashboard/hooks/useExperienceApproval', () => ({
  useApproveExperience: () => ({ mutate: vi.fn(), isPending: false }),
  useRejectExperience: () => ({ mutate: vi.fn(), isPending: false }),
}))

describe('Notifications (corporate)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Notifications title', () => {
    const { getByText } = renderWithProviders(<Notifications />)
    expect(getByText('Notifications')).toBeInTheDocument()
  })

  it('renders All tab', () => {
    const { getByRole } = renderWithProviders(<Notifications />)
    expect(getByRole('button', { name: /all/i })).toBeInTheDocument()
  })
})
