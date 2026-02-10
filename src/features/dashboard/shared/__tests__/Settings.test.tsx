import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import Settings from '../Settings'

vi.mock('@/stores', () => ({
  useAuthStore: () => ({ logout: vi.fn() }),
}))

describe('Settings (dashboard shared)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Settings title', () => {
    const { getByText } = renderWithProviders(<Settings />, {
      initialEntries: ['/dashboard/settings'],
    })
    expect(getByText('Settings')).toBeInTheDocument()
  })

  it('renders Manage your account', () => {
    const { getByText } = renderWithProviders(<Settings />, {
      initialEntries: ['/dashboard/settings'],
    })
    expect(getByText('Manage your account')).toBeInTheDocument()
  })

  it('renders Business Details option', () => {
    const { getAllByText } = renderWithProviders(<Settings />, {
      initialEntries: ['/dashboard/settings'],
    })
    expect(getAllByText('Business Details').length).toBeGreaterThan(0)
  })
})
