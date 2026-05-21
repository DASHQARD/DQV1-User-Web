import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { NotFoundPage } from '../NotFoundPage'

describe('NotFoundPage', () => {
  it('renders user-friendly 404 content without developer messages', () => {
    renderWithProviders(<NotFoundPage />)
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.queryByText(/unexpected application error/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/errorboundary/i)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /go to homepage/i })).toHaveAttribute('href', '/')
  })
})
