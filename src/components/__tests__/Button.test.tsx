import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { Button } from '../Button/Button'

describe('Button', () => {
  it('renders button with children', () => {
    const { getByRole } = renderWithProviders(<Button>Click me</Button>)
    expect(getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('renders as disabled when disabled prop is true', () => {
    const { getByRole } = renderWithProviders(<Button disabled>Submit</Button>)
    expect(getByRole('button')).toBeDisabled()
  })
})
