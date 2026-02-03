import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import AuthLayout from '../AuthLayout'

describe('AuthLayout', () => {
  it('renders layout with min-h-screen', () => {
    renderWithProviders(<AuthLayout />)
    expect(document.querySelector('.min-h-screen')).toBeInTheDocument()
  })
})
