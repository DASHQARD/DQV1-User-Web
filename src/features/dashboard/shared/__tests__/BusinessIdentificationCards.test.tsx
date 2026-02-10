import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import BusinessIdentificationCards from '../BusinessIdentificationCards'

vi.mock('@/features/dashboard/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/dashboard/components')>()
  return {
    ...actual,
    BusinessUploadIDForm: () => (
      <div data-testid="business-upload-id-form">BusinessUploadIDForm</div>
    ),
  }
})

describe('BusinessIdentificationCards (dashboard shared)', () => {
  it('renders breadcrumb with Compliance and Business Identification Documents', () => {
    renderWithProviders(<BusinessIdentificationCards />)
    expect(screen.getByRole('link', { name: /compliance/i })).toBeInTheDocument()
    expect(screen.getAllByText('Business Identification Documents').length).toBeGreaterThan(0)
  })

  it('renders heading', () => {
    renderWithProviders(<BusinessIdentificationCards />)
    expect(
      screen.getByRole('heading', { name: /business identification documents/i }),
    ).toBeInTheDocument()
  })

  it('renders BusinessUploadIDForm', () => {
    renderWithProviders(<BusinessIdentificationCards />)
    expect(screen.getByTestId('business-upload-id-form')).toBeInTheDocument()
  })
})
