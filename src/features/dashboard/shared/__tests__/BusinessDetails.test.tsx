import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import BusinessDetails from '../BusinessDetails'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/features/dashboard/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/dashboard/components')>()
  return {
    ...actual,
    BusinessDetailsForm: () => <div data-testid="business-details-form">BusinessDetailsForm</div>,
  }
})

describe('BusinessDetails (dashboard shared)', () => {
  it('renders Settings back link', () => {
    renderWithProviders(<BusinessDetails />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders BusinessDetailsForm', () => {
    renderWithProviders(<BusinessDetails />)
    expect(screen.getByTestId('business-details-form')).toBeInTheDocument()
  })

  it('navigates back when Settings is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BusinessDetails />)
    await user.click(screen.getByText('Settings'))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
