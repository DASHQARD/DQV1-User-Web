import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { VendorItems } from '../VendorItems'

describe('VendorItems', () => {
  it('renders vendor name', () => {
    renderWithProviders(<VendorItems name="Test Vendor" branches={3} />)
    expect(screen.getByText('Test Vendor')).toBeInTheDocument()
  })

  it('renders branches count', () => {
    renderWithProviders(<VendorItems name="Vendor" branches={5} />)
    expect(screen.getByText('5 Branches')).toBeInTheDocument()
  })
})
