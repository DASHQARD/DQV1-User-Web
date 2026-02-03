import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { Text } from '../Text/Text'

describe('Text', () => {
  it('renders children', () => {
    const { getByText } = renderWithProviders(<Text>Hello world</Text>)
    expect(getByText(/hello world/i)).toBeInTheDocument()
  })

  it('renders as heading when variant is h3', () => {
    const { getByRole } = renderWithProviders(
      <Text as="h3" variant="h3">
        Heading
      </Text>,
    )
    expect(getByRole('heading', { name: /heading/i })).toBeInTheDocument()
  })
})
