import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { DateInput } from '../DateInput/DateInput'

describe('DateInput', () => {
  it('renders label when provided', () => {
    renderWithProviders(<DateInput label="Start date" />)
    expect(screen.getByText('Start date')).toBeInTheDocument()
  })

  it('uses default label when not provided', () => {
    renderWithProviders(<DateInput />)
    expect(screen.getByText('Date Created')).toBeInTheDocument()
  })

  it('renders error message when error is provided', () => {
    renderWithProviders(<DateInput error="Invalid date" />)
    expect(screen.getByText('Invalid date')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    renderWithProviders(<DateInput placeholder="Pick a date" />)
    expect(screen.getByPlaceholderText('Pick a date')).toBeInTheDocument()
  })

  it('renders date picker input', () => {
    const { container } = renderWithProviders(<DateInput id="test-date" />)
    const input = container.querySelector('input')
    expect(input).toBeInTheDocument()
  })
})
