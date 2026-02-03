import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { Select } from '../Select/Select'

const options = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
]

describe('Select', () => {
  it('renders label when provided', () => {
    renderWithProviders(
      <Select options={options} value="" label="Choose" placeholder="Select..." />,
    )
    expect(screen.getByText('Choose')).toBeInTheDocument()
  })

  it('renders trigger with placeholder when no value', () => {
    renderWithProviders(<Select options={options} value="" placeholder="Select one" />)
    expect(screen.getByText('Select one')).toBeInTheDocument()
  })

  it('renders current value label when value is set', () => {
    renderWithProviders(<Select options={options} value="a" placeholder="Select..." />)
    expect(screen.getByText('Option A')).toBeInTheDocument()
  })

  it('renders error message when error is provided', () => {
    renderWithProviders(<Select options={options} value="" error="Required" />)
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('shows loader when loading is true', () => {
    renderWithProviders(<Select options={options} value="" loading />)
    expect(screen.getByAltText('Loading...')).toBeInTheDocument()
  })
})
