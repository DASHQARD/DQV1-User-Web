import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import Sidebar from '../Sidebar'

describe('Sidebar', () => {
  it('renders account label when not collapsed', () => {
    const setIsCollapsed = vi.fn()
    renderWithProviders(
      <Sidebar isCollapsed={false} setIsCollapsed={setIsCollapsed} accountLabel="Vendor Account">
        <li>Nav item</li>
      </Sidebar>,
    )
    expect(screen.getByText('Vendor Account')).toBeInTheDocument()
    expect(screen.getByText('Nav item')).toBeInTheDocument()
  })

  it('hides account label when collapsed', () => {
    renderWithProviders(
      <Sidebar isCollapsed={true} setIsCollapsed={vi.fn()} accountLabel="Vendor Account">
        <li>Nav</li>
      </Sidebar>,
    )
    expect(screen.queryByText('Vendor Account')).not.toBeInTheDocument()
  })

  it('toggles collapse when button is clicked', async () => {
    const user = userEvent.setup()
    const setIsCollapsed = vi.fn()
    renderWithProviders(
      <Sidebar isCollapsed={false} setIsCollapsed={setIsCollapsed} accountLabel="Account">
        <li>Nav</li>
      </Sidebar>,
    )
    await user.click(screen.getByRole('button', { name: /collapse sidebar/i }))
    expect(setIsCollapsed).toHaveBeenCalledWith(true)
  })

  it('shows expand aria-label when collapsed', () => {
    renderWithProviders(
      <Sidebar isCollapsed={true} setIsCollapsed={vi.fn()} accountLabel="Account">
        <li>Nav</li>
      </Sidebar>,
    )
    expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument()
  })

  it('renders accountMenuContent when provided and not collapsed', () => {
    renderWithProviders(
      <Sidebar
        isCollapsed={false}
        setIsCollapsed={vi.fn()}
        accountLabel="Account"
        accountMenuContent={<span data-testid="menu">Menu</span>}
      >
        <li>Nav</li>
      </Sidebar>,
    )
    expect(screen.getByTestId('menu')).toBeInTheDocument()
  })
})
