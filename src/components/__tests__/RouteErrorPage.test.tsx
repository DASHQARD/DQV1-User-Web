import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { RouteErrorPage } from '../RouteErrorPage'

const mockUseRouteError = vi.fn()

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
  return {
    ...actual,
    useRouteError: () => mockUseRouteError(),
  }
})

describe('RouteErrorPage', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders NotFoundPage for 404 route errors', () => {
    mockUseRouteError.mockReturnValue({ status: 404, statusText: 'Not Found' })
    renderWithProviders(<RouteErrorPage />)
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
    expect(screen.queryByText(/unexpected application error/i)).not.toBeInTheDocument()
  })

  it('renders generic error UI for non-404 errors', () => {
    mockUseRouteError.mockReturnValue({ status: 500, statusText: 'Server Error' })
    renderWithProviders(<RouteErrorPage />)
    expect(screen.getByText('Oops!')).toBeInTheDocument()
    expect(screen.queryByText(/unexpected application error/i)).not.toBeInTheDocument()
  })
})
