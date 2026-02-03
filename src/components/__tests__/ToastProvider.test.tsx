import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { ToastProvider } from '../ToastProvider/ToastProvider'

describe('ToastProvider', () => {
  it('renders children', () => {
    renderWithProviders(
      <ToastProvider>
        <div data-testid="child">Child</div>
      </ToastProvider>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Child')).toBeInTheDocument()
  })
})
