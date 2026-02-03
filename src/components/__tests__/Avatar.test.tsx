import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { Avatar } from '../Avatar/Avatar'

describe('Avatar', () => {
  it('renders when no src (initials or placeholder)', () => {
    const { container } = renderWithProviders(<Avatar />)
    expect(container.querySelector('[class*="rounded-full"]')).toBeInTheDocument()
  })

  it('renders initials when name is provided and no src', () => {
    const { getByText } = renderWithProviders(<Avatar name="John Doe" />)
    expect(getByText('JD')).toBeInTheDocument()
  })

  it('renders image when src is provided', () => {
    const { getByRole } = renderWithProviders(
      <Avatar src="https://example.com/avatar.jpg" alt="Custom alt" />,
    )
    expect(getByRole('img', { name: /custom alt/i })).toBeInTheDocument()
  })
})
