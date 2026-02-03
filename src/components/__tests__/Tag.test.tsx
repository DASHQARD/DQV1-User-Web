import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { Tag } from '../Tag/Tag'

describe('Tag', () => {
  it('renders tag value', () => {
    const { getByText } = renderWithProviders(<Tag value="Active" />)
    expect(getByText(/active/i)).toBeInTheDocument()
  })

  it('renders with variant', () => {
    const { getByText } = renderWithProviders(<Tag value="Success" variant="success" />)
    expect(getByText(/success/i)).toBeInTheDocument()
  })
})
