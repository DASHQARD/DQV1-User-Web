import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { ExperienceApprovalNotifications } from '../ExperienceApprovalNotifications'

vi.mock('@/hooks', () => ({
  usePersistedModalState: () => ({
    openModal: vi.fn(),
    closeModal: vi.fn(),
    isModalOpen: () => false,
  }),
}))

vi.mock('@/features/dashboard/hooks/useExperienceApproval', () => ({
  useRejectExperience: () => ({ mutate: vi.fn(), isPending: false }),
}))

describe('ExperienceApprovalNotifications', () => {
  it('renders notification button with title', () => {
    renderWithProviders(<ExperienceApprovalNotifications />)
    const btn = screen.getByTitle(/experience approval notifications/i)
    expect(btn).toBeInTheDocument()
  })
})
