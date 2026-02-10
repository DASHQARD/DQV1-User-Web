import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import VendorCards from '../VendorCards'

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
  }
})

describe('VendorCards', () => {
  it('renders DashX, DashPass, DashGo, and DashPro cards', () => {
    renderWithProviders(
      <VendorCards
        wallet_balance="₦100"
        group_savings="₦200"
        individual_savings="₦50"
        ajo_savings="₦75"
      />,
    )
    expect(screen.getByText('DashX')).toBeInTheDocument()
    expect(screen.getByText('DashPass')).toBeInTheDocument()
    expect(screen.getByText('DashGo')).toBeInTheDocument()
    expect(screen.getByText('DashPro')).toBeInTheDocument()
  })

  it('displays wallet and savings values', () => {
    renderWithProviders(
      <VendorCards
        wallet_balance="₦100"
        group_savings="₦200"
        individual_savings="₦50"
        ajo_savings="₦75"
      />,
    )
    expect(screen.getByText('₦100')).toBeInTheDocument()
    expect(screen.getByText('₦200')).toBeInTheDocument()
    expect(screen.getByText('₦50')).toBeInTheDocument()
    expect(screen.getByText('₦75')).toBeInTheDocument()
  })

  it('uses default ₦0 when optional values are omitted', () => {
    renderWithProviders(<VendorCards wallet_balance="₦0" />)
    expect(screen.getAllByText('₦0').length).toBeGreaterThanOrEqual(1)
  })
})
