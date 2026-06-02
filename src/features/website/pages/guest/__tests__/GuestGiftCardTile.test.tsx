import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GuestGiftCardTile } from '../GuestGiftCardTile'

describe('GuestGiftCardTile', () => {
  it('renders expiry progress bar for purchased cards', () => {
    render(
      <GuestGiftCardTile
        product="FlexiWorkGh Retail Rewards Card"
        cardType="DashX"
        amount={151.5}
        currency="GHS"
        expiryDate="2026-06-30T00:00:00.000Z"
        vendorName="FlexiWorkGh"
        statusLabel="Paid"
        statusClassName="bg-emerald-50 text-emerald-800"
        redemptionCode="7CR5J5"
      />,
    )

    expect(screen.getByRole('progressbar', { name: /Card status: active/i })).toBeInTheDocument()
    expect(screen.getByText(/Expires/i)).toBeInTheDocument()
    expect(screen.getByText(/Code: 7CR5J5/i)).toBeInTheDocument()
  })

  it('shows no expiry label and redemption code when expiry is null', () => {
    render(
      <GuestGiftCardTile
        product="DashPro"
        cardType="DashPro"
        amount={10}
        redemptionCode="R42JYK"
      />,
    )

    expect(screen.getByText('No expiry date')).toBeInTheDocument()
    expect(screen.getByText('Code: R42JYK')).toBeInTheDocument()
  })
})
