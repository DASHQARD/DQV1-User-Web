import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { Loader } from '../Loader/Loader'

describe('Loader', () => {
  it('renders loading image with alt text', () => {
    const { getByRole } = renderWithProviders(<Loader />)
    expect(getByRole('img', { name: /loading/i })).toBeInTheDocument()
  })
})
