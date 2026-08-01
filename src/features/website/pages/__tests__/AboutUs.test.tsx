import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import AboutUs from '../aboutUs/AboutUs'

vi.mock('@/assets/svgs/dashpro_bg.svg', () => ({ default: '/dashpro-bg.svg' }))

describe('AboutUs (website)', () => {
  it('renders About Us badge', () => {
    renderWithProviders(<AboutUs />)
    expect(screen.getByText('About Us')).toBeInTheDocument()
  })

  it('renders main heading', () => {
    renderWithProviders(<AboutUs />)
    expect(screen.getByText('Transforming Digital Gifting in Ghana')).toBeInTheDocument()
  })
})
