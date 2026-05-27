import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import VendorsProfile from '../vendors/VendorsProfile'

vi.mock('@/assets/svgs/dashgo_bg.svg', () => ({ default: '/dashgo-bg.svg' }))
vi.mock('@/assets/gifs/loader.gif', () => ({ default: '/loader.gif' }))

const mockUseVendorProfilePage = vi.fn()

vi.mock('../../hooks/website', () => ({
  useVendorProfilePage: (vendorId: string) => mockUseVendorProfilePage(vendorId),
}))

// useSearchParams - no vendor_id
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  }
})

describe('VendorsProfile (website)', () => {
  beforeEach(() => {
    mockUseVendorProfilePage.mockReturnValue({
      vendor: null,
      displayName: '',
      isLoading: false,
    })
  })

  it('shows "Vendor not found" when vendor_id is missing', () => {
    renderWithProviders(<VendorsProfile />)
    expect(screen.getByText('Vendor not found')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Browse all vendors/i })).toBeInTheDocument()
  })
})
