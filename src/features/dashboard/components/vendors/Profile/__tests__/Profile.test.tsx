import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import Profile, { PaymentInformation } from '../Profile'

describe('VendorProfile (Profile)', () => {
  describe('Profile', () => {
    it('renders name, tier and status', () => {
      renderWithProviders(
        <Profile name="Acme Corp" tier="Gold" status="active">
          <div data-testid="children">Content</div>
        </Profile>,
      )
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      expect(screen.getByText(/Tier Gold/i)).toBeInTheDocument()
      expect(screen.getByText('active')).toBeInTheDocument()
      expect(screen.getByTestId('children')).toHaveTextContent('Content')
    })

    it('renders tier as number', () => {
      renderWithProviders(
        <Profile name="Vendor" tier={2} status="pending">
          {null}
        </Profile>,
      )
      expect(screen.getByText(/Tier 2/i)).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = renderWithProviders(
        <Profile name="X" tier="1" status="active" className="custom-class">
          {null}
        </Profile>,
      )
      const section = container.querySelector('section.custom-class')
      expect(section).toBeInTheDocument()
    })
  })

  describe('PaymentInformation', () => {
    it('renders title, amount and children', () => {
      renderWithProviders(
        <PaymentInformation
          name="Balance"
          iconName="bi:wallet2"
          iconBgColor="bg-blue-500"
          title="Balance"
          amount="₦1,000"
          image="/img.png"
        >
          <span data-testid="extra">Extra</span>
        </PaymentInformation>,
      )
      expect(screen.getByText('Balance')).toBeInTheDocument()
      expect(screen.getByText('₦1,000')).toBeInTheDocument()
      expect(screen.getByTestId('extra')).toBeInTheDocument()
    })

    it('renders image with alt from title', () => {
      renderWithProviders(
        <PaymentInformation
          name="Wallet"
          iconName="bi:wallet2"
          iconBgColor="bg-blue-500"
          title="Wallet"
          amount="₦0"
          image="/wallet.png"
        >
          {null}
        </PaymentInformation>,
      )
      const img = document.querySelector('img[alt="Wallet"]')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', '/wallet.png')
    })
  })
})
