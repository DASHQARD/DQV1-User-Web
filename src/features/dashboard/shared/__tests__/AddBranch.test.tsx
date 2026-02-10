import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import AddBranch from '../AddBranch'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams()],
  }
})

vi.mock('@/hooks', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
  useUserProfile: () => ({
    useGetUserProfileService: () => ({
      data: { branches: [] },
      isLoading: false,
    }),
  }),
}))

describe('AddBranch (dashboard shared)', () => {
  it('renders Add Branch heading and breadcrumb', () => {
    renderWithProviders(<AddBranch />)
    expect(screen.getByRole('heading', { name: 'Add Branch' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /compliance/i })).toBeInTheDocument()
  })

  it('renders Add your branch details here section', () => {
    renderWithProviders(<AddBranch />)
    expect(screen.getByText('Add your branch details here')).toBeInTheDocument()
    expect(screen.getByText(/start by adding your main branch details/i)).toBeInTheDocument()
  })

  it('renders Add Branch and Import buttons', () => {
    renderWithProviders(<AddBranch />)
    expect(screen.getByRole('button', { name: /add branch/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument()
  })

  it('renders Add Main Branch section', () => {
    renderWithProviders(<AddBranch />)
    expect(screen.getByText('Add Main Branch')).toBeInTheDocument()
  })

  it('navigates to create branch when Add Branch button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AddBranch />)
    const addBtn = screen.getAllByRole('button', { name: /add branch/i })[0]
    await user.click(addBtn)
    expect(mockNavigate).toHaveBeenCalled()
  })
})
