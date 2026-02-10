import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { VendorItems } from '../VendorItems'

vi.mock('@/hooks', () => ({
  usePresignedURL: () => ({ mutateAsync: vi.fn().mockResolvedValue('') }),
}))

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
