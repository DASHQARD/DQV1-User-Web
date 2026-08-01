import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import Hero from '../Hero/Hero'

describe('Hero', () => {
  it('renders main heading', () => {
    renderWithProviders(<Hero />)
    expect(
      screen.getByText(/Gift Cards for the people that matter most in your life/i),
    ).toBeInTheDocument()
  })

  it('renders badge text', () => {
    renderWithProviders(<Hero />)
    expect(screen.getByText(/Ghana's Leading Digital Gifting Platform/i)).toBeInTheDocument()
  })

  it('renders Create, Connect. Celebrate.', () => {
    renderWithProviders(<Hero />)
    expect(screen.getByText('Create, Connect. Celebrate.')).toBeInTheDocument()
  })

  it('renders Get Started and Get a Card buttons', () => {
    renderWithProviders(<Hero />)
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /get a card/i })).toBeInTheDocument()
  })
})
