import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { CurrencyCell, DateCell, EmailCell, NameCell, StatusCell } from '../Cells'

function mockRow<T>(original: T) {
  return { original } as any
}

describe('CurrencyCell', () => {
  it('formats amount as currency', () => {
    renderWithProviders(<CurrencyCell row={mockRow({ amount: 100 })} getValue={() => 100} />)
    expect(screen.getByText(/100|GH₵|GHS/)).toBeInTheDocument()
  })
})

describe('DateCell', () => {
  it('formats date when getValue returns string', () => {
    renderWithProviders(<DateCell getValue={() => '2024-01-15'} />)
    expect(screen.getByText(/2024|Jan|15/)).toBeInTheDocument()
  })

  it('renders dash when getValue is empty', () => {
    renderWithProviders(<DateCell getValue={() => ''} />)
    expect(screen.getByText('-')).toBeInTheDocument()
  })
})

describe('EmailCell', () => {
  it('renders email from row.original', () => {
    renderWithProviders(
      <EmailCell row={mockRow({ email: 'test@example.com' })} getValue={() => ''} />,
    )
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('renders user_email when email is missing', () => {
    renderWithProviders(
      <EmailCell row={mockRow({ user_email: 'user@test.com' })} getValue={() => ''} />,
    )
    expect(screen.getByText('user@test.com')).toBeInTheDocument()
  })

  it('renders dash when no email', () => {
    renderWithProviders(<EmailCell row={mockRow({})} getValue={() => ''} />)
    expect(screen.getByText('-')).toBeInTheDocument()
  })
})

describe('NameCell', () => {
  it('renders full_name when present', () => {
    renderWithProviders(<NameCell row={mockRow({ full_name: 'Jane Doe' })} getValue={() => ''} />)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('renders first_name and last_name when full_name missing', () => {
    renderWithProviders(
      <NameCell row={mockRow({ first_name: 'John', last_name: 'Doe' })} getValue={() => ''} />,
    )
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})

describe('StatusCell', () => {
  it('renders status in a tag', () => {
    renderWithProviders(
      <StatusCell row={mockRow({ status: 'approved' })} getValue={() => 'approved'} />,
    )
    expect(screen.getByText('approved')).toBeInTheDocument()
  })

  it('renders dash when status is empty', () => {
    renderWithProviders(<StatusCell row={mockRow({ status: '' })} getValue={() => ''} />)
    expect(screen.getByText('-')).toBeInTheDocument()
  })
})
