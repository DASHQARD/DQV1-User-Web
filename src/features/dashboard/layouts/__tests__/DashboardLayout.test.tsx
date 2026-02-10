import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { Routes, Route } from 'react-router-dom'
import DashboardLayout from '../DashboardLayout'

vi.mock('../../components', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}))
vi.mock('@/components', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}))

function DashboardLayoutWithOutlet() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<div>Dashboard content</div>} />
      </Route>
    </Routes>
  )
}

describe('DashboardLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Sidebar', () => {
    const { getByTestId } = renderWithProviders(<DashboardLayoutWithOutlet />, {
      initialEntries: ['/dashboard'],
    })
    expect(getByTestId('sidebar')).toBeInTheDocument()
  })

  it('renders Navbar', () => {
    const { getByTestId } = renderWithProviders(<DashboardLayoutWithOutlet />, {
      initialEntries: ['/dashboard'],
    })
    expect(getByTestId('navbar')).toBeInTheDocument()
  })

  it('renders outlet content', () => {
    const { getByText } = renderWithProviders(<DashboardLayoutWithOutlet />, {
      initialEntries: ['/dashboard'],
    })
    expect(getByText('Dashboard content')).toBeInTheDocument()
  })
})
