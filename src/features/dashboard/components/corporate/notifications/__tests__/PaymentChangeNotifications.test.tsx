import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { PaymentChangeNotifications } from '../PaymentChangeNotifications'

describe('PaymentChangeNotifications', () => {
  it('renders without error', () => {
    const { container } = renderWithProviders(<PaymentChangeNotifications />)
    expect(container).toBeInTheDocument()
  })
})
