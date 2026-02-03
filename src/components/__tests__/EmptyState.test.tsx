import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { EmptyState } from '../EmptyState/EmptyState'

describe('EmptyState', () => {
  it('renders title and description', () => {
    const { getByText } = renderWithProviders(
      <EmptyState
        image="https://example.com/placeholder.png"
        title="No data"
        description="There is nothing here yet."
      />,
    )
    expect(getByText(/no data/i)).toBeInTheDocument()
    expect(getByText(/there is nothing here yet/i)).toBeInTheDocument()
  })
})
