import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { CustomErrorBoundary } from '../CustomErrorBoundary/CustomErrorBoundary'

const mockUseRouteError = vi.fn()

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
  return {
    ...actual,
    useRouteError: () => mockUseRouteError(),
  }
})

describe('CustomErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders statusText when error is a route error response', () => {
    mockUseRouteError.mockReturnValue({
      status: 500,
      statusText: 'Server Error',
      data: null,
      internal: false,
    })
    renderWithProviders(<CustomErrorBoundary />)
    expect(screen.getByText('Oops!')).toBeInTheDocument()
    expect(screen.getByText('Server Error')).toBeInTheDocument()
    expect(screen.queryByText(/unexpected application error/i)).not.toBeInTheDocument()
  })

  it('renders generic message for unexpected errors without leaking internals', () => {
    mockUseRouteError.mockReturnValue(new Error('Internal stack trace details'))
    renderWithProviders(<CustomErrorBoundary />)
    expect(screen.getByText('Oops!')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong. Please try again later.')).toBeInTheDocument()
    expect(screen.queryByText(/stack trace/i)).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    mockUseRouteError.mockReturnValue({ message: 'Error' })
    const { container } = renderWithProviders(<CustomErrorBoundary className="custom-class" />)
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('custom-class')
  })
})
