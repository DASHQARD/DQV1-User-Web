import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import UploadID from '../UploadID'

vi.mock('@/features/dashboard/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/dashboard/components')>()
  return {
    ...actual,
    UserUploadIDForm: () => <div data-testid="user-upload-id-form">UserUploadIDForm</div>,
  }
})

describe('UploadID (dashboard shared)', () => {
  it('renders breadcrumb with Compliance and Upload ID', () => {
    renderWithProviders(<UploadID />)
    expect(screen.getByRole('link', { name: /compliance/i })).toBeInTheDocument()
    expect(screen.getByText('Upload ID')).toBeInTheDocument()
  })

  it('renders Profile Information heading', () => {
    renderWithProviders(<UploadID />)
    expect(
      screen.getByRole('heading', { name: /profile information/i }),
    ).toBeInTheDocument()
  })

  it('renders UserUploadIDForm', () => {
    renderWithProviders(<UploadID />)
    expect(screen.getByTestId('user-upload-id-form')).toBeInTheDocument()
  })
})
