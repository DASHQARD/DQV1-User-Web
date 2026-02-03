import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { Checkbox } from '../Checkbox/Checkbox'

describe('Checkbox', () => {
  it('renders checkbox', () => {
    const { getByRole } = renderWithProviders(<Checkbox />)
    expect(getByRole('checkbox')).toBeInTheDocument()
  })

  it('renders with label', () => {
    const { getByRole, getByText } = renderWithProviders(<Checkbox label="Accept terms" />)
    expect(getByRole('checkbox')).toBeInTheDocument()
    expect(getByText(/accept terms/i)).toBeInTheDocument()
  })

  it('can be disabled', () => {
    const { getByRole } = renderWithProviders(<Checkbox disabled />)
    expect(getByRole('checkbox')).toBeDisabled()
  })
})
