import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { CustomIcon } from '../CustomIcon/CustomIcon'

describe('CustomIcon', () => {
  it('renders with data-testid from name', () => {
    renderWithProviders(<CustomIcon name="Circle" />)
    expect(screen.getByTestId('icon-Circle')).toBeInTheDocument()
  })

  it('applies className', () => {
    const { container } = renderWithProviders(<CustomIcon name="Circle" className="my-class" />)
    const span = container.querySelector('.my-class')
    expect(span).toBeInTheDocument()
  })
})
