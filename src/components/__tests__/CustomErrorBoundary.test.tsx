import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { CustomErrorBoundary } from '../CustomErrorBoundary/CustomErrorBoundary'

const mockUseRouteError = vi.fn()

vi.mock('react-router', () => ({
  useRouteError: () => mockUseRouteError(),
}))

describe('CustomErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders generic error message when error has statusText', () => {
    mockUseRouteError.mockReturnValue({ statusText: 'Not Found', message: 'Fallback' })
    renderWithProviders(<CustomErrorBoundary />)
    expect(screen.getByText('Oops!')).toBeInTheDocument()
    expect(screen.getByText('Sorry, an unexpected error has occurred.')).toBeInTheDocument()
    expect(screen.getByText('Not Found')).toBeInTheDocument()
  })

  it('renders error message when error has message but no statusText', () => {
    mockUseRouteError.mockReturnValue({ message: 'Something went wrong' })
    renderWithProviders(<CustomErrorBoundary />)
    expect(screen.getByText('Oops!')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    mockUseRouteError.mockReturnValue({ message: 'Error' })
    const { container } = renderWithProviders(<CustomErrorBoundary className="custom-class" />)
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('custom-class')
  })
})
