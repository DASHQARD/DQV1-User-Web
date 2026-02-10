import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import Compliance from '../Compliance'

describe('Compliance (dashboard shared)', () => {
  it('renders Compliance text', () => {
    renderWithProviders(<Compliance />)
    expect(screen.getByText('Compliance')).toBeInTheDocument()
  })
})
