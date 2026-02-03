import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { Providers } from '../Providers/Providers'

vi.mock('@/hooks', () => ({
  useAutoRefreshToken: vi.fn(),
}))

describe('Providers', () => {
  it('renders children', () => {
    renderWithProviders(
      <Providers>
        <span data-testid="child">Child content</span>
      </Providers>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })
})
