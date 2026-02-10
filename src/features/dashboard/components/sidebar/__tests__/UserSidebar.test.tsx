import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import UserSidebar from '../UserSidebar'

const mockSetIsCollapsed = vi.fn()
vi.mock('@/features/dashboard/hooks', () => ({
  useUserSidebar: () => ({
    navigate: vi.fn(),
    isCollapsed: false,
    setIsCollapsed: mockSetIsCollapsed,
    userProfileData: { fullname: 'Test User' },
    file: null,
    setFile: vi.fn(),
    imageUrl: null,
    handleImageUpload: vi.fn(),
    isUploadingImage: false,
    isActive: (path: string) => path === '/dashboard',
    handleLogout: vi.fn(),
    isLoggingOut: false,
  }),
}))

describe('UserSidebar', () => {
  it('renders sidebar with user name and collapse button', () => {
    renderWithProviders(<UserSidebar />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeInTheDocument()
  })

  it('toggles collapse when button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<UserSidebar />)
    await user.click(screen.getByRole('button', { name: /collapse sidebar/i }))
    expect(mockSetIsCollapsed).toHaveBeenCalledWith(true)
  })

  it('renders Settings and Log Out in footer', () => {
    renderWithProviders(<UserSidebar />)
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
  })
})
