import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import { Tabs } from '../Tabs/Tabs'

const tabOptions = [
  { label: 'Tab 1', value: 'tab1' },
  { label: 'Tab 2', value: 'tab2' },
]

describe('Tabs', () => {
  it('renders all tab labels', () => {
    const setActive = vi.fn()
    renderWithProviders(<Tabs tabs={tabOptions} active="tab1" setActive={setActive} />)
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
  })

  it('calls setActive when a tab is clicked', async () => {
    const user = userEvent.setup()
    const setActive = vi.fn()
    renderWithProviders(<Tabs tabs={tabOptions} active="tab1" setActive={setActive} />)
    await user.click(screen.getByText('Tab 2'))
    expect(setActive).toHaveBeenCalledWith('tab2')
  })

  it('applies active styling to current tab', () => {
    const setActive = vi.fn()
    renderWithProviders(<Tabs tabs={tabOptions} active="tab2" setActive={setActive} />)
    const tab2Button = screen.getByText('Tab 2').closest('button')
    expect(tab2Button).toHaveClass('text-primary-700')
  })
})
