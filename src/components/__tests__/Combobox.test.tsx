import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { Combobox } from '../Combobox/Combobox'

const defaultOptions = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
]

describe('Combobox', () => {
  it('renders with label when label prop is provided', () => {
    const onChange = vi.fn()
    renderWithProviders(
      <Combobox options={defaultOptions} onChange={onChange} label="Choose one" />,
    )
    expect(screen.getByText('Choose one')).toBeInTheDocument()
  })

  it('renders required indicator when isRequired is true', () => {
    const onChange = vi.fn()
    renderWithProviders(
      <Combobox options={defaultOptions} onChange={onChange} label="Required" isRequired />,
    )
    expect(screen.getByText('Required')).toBeInTheDocument()
    const requiredStar = screen.getByText('*')
    expect(requiredStar).toBeInTheDocument()
  })

  it('renders error message when error is string', () => {
    const onChange = vi.fn()
    renderWithProviders(
      <Combobox options={defaultOptions} onChange={onChange} error="This field is required" />,
    )
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('renders error message when error is object with message', () => {
    const onChange = vi.fn()
    renderWithProviders(
      <Combobox
        options={defaultOptions}
        onChange={onChange}
        error={{ message: 'Invalid selection' }}
      />,
    )
    expect(screen.getByText('Invalid selection')).toBeInTheDocument()
  })

  it('renders combobox control', () => {
    const onChange = vi.fn()
    renderWithProviders(<Combobox options={defaultOptions} onChange={onChange} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('applies custom className to wrapper', () => {
    const onChange = vi.fn()
    const { container } = renderWithProviders(
      <Combobox options={defaultOptions} onChange={onChange} className="custom-wrapper" />,
    )
    const wrapper = container.querySelector('.custom-wrapper')
    expect(wrapper).toBeInTheDocument()
  })
})
