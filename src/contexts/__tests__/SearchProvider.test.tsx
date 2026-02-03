import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { SearchProvider } from '../SearchProvider'

describe('SearchProvider', () => {
  it('renders children', () => {
    renderWithProviders(
      <SearchProvider>
        <div data-testid="child">Child content</div>
      </SearchProvider>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })
})
