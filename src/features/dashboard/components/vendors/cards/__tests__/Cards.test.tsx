import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import VendorCards from '../Cards'

const defaultProps = {
  title: 'Total Vendors',
  value: '12',
  IconName: 'hugeicons:wallet-01',
  IconBg: 'bg-primary-500',
  image: '/wallet.svg',
  href: '/dashboard/vendors',
}

describe('VendorCards (Cards)', () => {
  it('renders title and value', () => {
    renderWithProviders(<VendorCards {...defaultProps} />)
    expect(screen.getByText('Total Vendors')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('renders a link with correct href', () => {
    renderWithProviders(<VendorCards {...defaultProps} />)
    const link = screen.getByRole('link', { name: /total vendors/i })
    expect(link).toHaveAttribute('href', '/dashboard/vendors')
  })

  it('renders with custom className', () => {
    const { container } = renderWithProviders(
      <VendorCards {...defaultProps} className="custom-class" />,
    )
    const link = container.querySelector('a.custom-class')
    expect(link).toBeInTheDocument()
  })
})
