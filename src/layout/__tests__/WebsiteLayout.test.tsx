import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import WebsiteLayout from '../WebsiteLayout'

vi.mock('../../components', () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
  Footer: () => <footer data-testid="footer">Footer</footer>,
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet</div>,
  }
})

describe('WebsiteLayout', () => {
  it('renders Navbar and Footer', () => {
    renderWithProviders(<WebsiteLayout />)
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders Outlet for child routes', () => {
    renderWithProviders(<WebsiteLayout />)
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })
})
