import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import UserSettings from '../settings/UserSettings'

vi.mock('@/stores', () => ({
  useAuthStore: () => ({ logout: vi.fn() }),
}))

describe('UserSettings (user)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Settings section with Change Password', () => {
    const { getAllByText } = renderWithProviders(<UserSettings />, {
      initialEntries: ['/dashboard/settings'],
    })
    expect(getAllByText('Change Password').length).toBeGreaterThan(0)
  })

  it('renders Personal Information option', () => {
    const { getAllByText } = renderWithProviders(<UserSettings />, {
      initialEntries: ['/dashboard/settings'],
    })
    expect(getAllByText('Personal Information').length).toBeGreaterThan(0)
  })
})
