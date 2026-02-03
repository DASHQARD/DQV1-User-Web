import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { Input } from '../Input/Input'

describe('Input', () => {
  it('renders input', () => {
    renderWithProviders(<Input placeholder="Enter value" />)
    expect(screen.getByPlaceholderText(/enter value/i)).toBeInTheDocument()
  })

  it('renders with label', () => {
    renderWithProviders(<Input label="Email" name="email" />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('renders error when error prop is provided', () => {
    renderWithProviders(<Input label="Email" error="Email is required" />)
    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('renders required indicator when isRequired is true', () => {
    renderWithProviders(<Input label="Email" isRequired />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders as textarea when type is textarea', () => {
    renderWithProviders(<Input type="textarea" placeholder="Message" />)
    expect(screen.getByPlaceholderText('Message')).toBeInTheDocument()
    expect(document.querySelector('textarea')).toBeInTheDocument()
  })
})
