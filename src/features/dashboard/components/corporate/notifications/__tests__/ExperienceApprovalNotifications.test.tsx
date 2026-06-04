import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { ExperienceApprovalNotifications } from '../ExperienceApprovalNotifications'

vi.mock('@/features/dashboard/hooks/useVendorOnboardingProgress', () => ({
  useVendorOnboardingProgress: () => ({
    getIsNavItemDisabled: () => false,
  }),
}))

vi.mock('@/features/dashboard/hooks/useVendorPendingApprovalsCount', () => ({
  useVendorPendingApprovalsCount: () => ({ pendingCount: 2, isLoading: false }),
}))

describe('ExperienceApprovalNotifications', () => {
  it('renders approval bell with pending count', () => {
    renderWithProviders(<ExperienceApprovalNotifications />)
    expect(screen.getByLabelText(/2 approvals need your attention/i)).toBeInTheDocument()
  })
})
