import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { Input } from '../Input/Input'

describe('Input', () => {
  it('renders input', () => {
    const { getByPlaceholderText } = renderWithProviders(<Input placeholder="Enter value" />)
    expect(getByPlaceholderText(/enter value/i)).toBeInTheDocument()
  })

  it('renders with label', () => {
    const { getByLabelText } = renderWithProviders(<Input label="Email" name="email" />)
    expect(getByLabelText(/email/i)).toBeInTheDocument()
  })
})
