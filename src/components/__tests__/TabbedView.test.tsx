import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { TabbedView } from '../TabbedView/TabbedView'

vi.mock('@/hooks', () => ({
  useUrlState: vi.fn(() => ['tab1', vi.fn()]),
}))

const DummyTab1 = () => <div>Content 1</div>
const DummyTab2 = () => <div>Content 2</div>

describe('TabbedView', () => {
  it('renders default tab content', () => {
    renderWithProviders(
      <TabbedView
        defaultTab="tab1"
        tabs={[
          { key: 'tab1', label: 'Tab 1', component: DummyTab1 },
          { key: 'tab2', label: 'Tab 2', component: DummyTab2 },
        ]}
      />,
    )
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })
})
