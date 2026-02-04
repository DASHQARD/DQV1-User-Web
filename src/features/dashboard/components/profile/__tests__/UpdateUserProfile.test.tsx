import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import UpdateUserProfile from '../UpdateUserProfile'

vi.mock('@/hooks', () => ({
  useUserProfile: () => ({
    useGetUserProfileService: () => ({
      data: { fullname: 'Jane Doe', email: 'jane@example.com', dob: '1990-01-01' },
    }),
  }),
}))

vi.mock('@/features/dashboard/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/dashboard/hooks')>()
  return {
    ...actual,
    useUserInfo: () => ({
      useUpdateUserInfoService: () => ({ mutate: vi.fn(), isPending: false }),
    }),
  }
})

describe('UpdateUserProfile', () => {
  it('renders Basic Information heading', () => {
    renderWithProviders(<UpdateUserProfile />)
    expect(screen.getByText('Basic Information')).toBeInTheDocument()
  })

  it('renders fullname, email and dob inputs', () => {
    renderWithProviders(<UpdateUserProfile />)
    expect(screen.getByPlaceholderText(/enter your full name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your date of birth/i)).toBeInTheDocument()
  })

  it('renders Save and Cancel buttons', () => {
    renderWithProviders(<UpdateUserProfile />)
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })
})
