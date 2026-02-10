import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { BusinessLogoSettings } from '../BusinessLogoSettings'

let mockUploadedFileUrl: string | null = null
vi.mock('@/features/dashboard/vendor/hooks', () => ({
  useBusinessLogoSettings: () => ({
    logoUrl: null,
    get uploadedFileUrl() {
      return mockUploadedFileUrl
    },
    businessName: 'Test Business',
    handleFileChange: vi.fn(),
    handleSave: vi.fn(),
    isPending: false,
  }),
}))

describe('BusinessLogoSettings (vendor)', () => {
  beforeEach(() => {
    mockUploadedFileUrl = null
  })

  it('renders Current Logo section', () => {
    renderWithProviders(<BusinessLogoSettings />)
    expect(screen.getByText('Current Logo')).toBeInTheDocument()
    expect(screen.getByText('No logo uploaded')).toBeInTheDocument()
  })

  it('renders Upload New Logo section', () => {
    renderWithProviders(<BusinessLogoSettings />)
    expect(screen.getByText('Upload New Logo')).toBeInTheDocument()
    expect(screen.getByText(/recommended: square image/i)).toBeInTheDocument()
  })

  it('shows Save Logo button when uploadedFileUrl is set', () => {
    mockUploadedFileUrl = 'https://example.com/logo.png'
    renderWithProviders(<BusinessLogoSettings />)
    expect(screen.getByRole('button', { name: /save logo/i })).toBeInTheDocument()
  })
})
