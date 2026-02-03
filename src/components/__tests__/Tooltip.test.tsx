import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip/Tooltip'

beforeEach(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

describe('Tooltip', () => {
  it('renders trigger', () => {
    renderWithProviders(
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button">Hover me</button>
        </TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>,
    )
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument()
  })

  it('renders content when defaultOpen', () => {
    renderWithProviders(
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <button type="button">Trigger</button>
        </TooltipTrigger>
        <TooltipContent>Visible tooltip</TooltipContent>
      </Tooltip>,
    )
    expect(screen.getByRole('tooltip', { name: 'Visible tooltip' })).toBeInTheDocument()
  })
})
