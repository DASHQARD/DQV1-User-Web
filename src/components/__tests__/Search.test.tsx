import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import SearchBox from '../Search/SearchBox'

describe('Search (SearchBox)', () => {
  it('renders with default placeholder', () => {
    renderWithProviders(<SearchBox value="" onChange={() => {}} />)
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    renderWithProviders(<SearchBox value="" onChange={() => {}} placeholder="Search items..." />)
    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument()
  })

  it('displays value', () => {
    renderWithProviders(<SearchBox value="query" onChange={() => {}} />)
    expect(screen.getByDisplayValue('query')).toBeInTheDocument()
  })

  it('calls onChange when user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<SearchBox value="" onChange={onChange} />)
    const input = screen.getByPlaceholderText('Search')
    await user.type(input, 'x')
    expect(onChange).toHaveBeenCalled()
  })
})
