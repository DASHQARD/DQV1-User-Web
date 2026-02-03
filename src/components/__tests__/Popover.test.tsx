import { describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import { Popover, PopoverTrigger, PopoverContent } from '../Popover/Popover'

describe('Popover', () => {
  it('renders trigger and shows content when opened', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Popover>
        <PopoverTrigger asChild>
          <button type="button">Open</button>
        </PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>,
    )
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
    expect(screen.queryByText('Popover content')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByText('Popover content')).toBeInTheDocument()
  })

  it('renders with defaultOpen', () => {
    renderWithProviders(
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <button type="button">Trigger</button>
        </PopoverTrigger>
        <PopoverContent>Visible content</PopoverContent>
      </Popover>,
    )
    expect(screen.getByText('Visible content')).toBeInTheDocument()
  })

  it('has data-slot attributes for styling', () => {
    renderWithProviders(
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <button type="button">Trigger</button>
        </PopoverTrigger>
        <PopoverContent data-testid="popover-content">Content</PopoverContent>
      </Popover>,
    )
    const content = screen.getByTestId('popover-content')
    expect(content).toHaveAttribute('data-slot', 'popover-content')
  })
})
