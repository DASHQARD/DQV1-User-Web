import { describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import { RadioGroup, RadioGroupItem } from '../Radio/Radio'

describe('Radio', () => {
  it('renders radio group with items', () => {
    renderWithProviders(
      <RadioGroup>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="a" id="r1" />
          <label htmlFor="r1">Option A</label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="b" id="r2" />
          <label htmlFor="r2">Option B</label>
        </div>
      </RadioGroup>,
    )
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /option a/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /option b/i })).toBeInTheDocument()
  })

  it('allows selecting an option', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <RadioGroup defaultValue="a">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="a" id="r1" />
          <label htmlFor="r1">Option A</label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="b" id="r2" />
          <label htmlFor="r2">Option B</label>
        </div>
      </RadioGroup>,
    )
    const optionB = screen.getByRole('radio', { name: /option b/i })
    await user.click(optionB)
    expect(optionB).toBeChecked()
  })

  it('has data-slot for styling', () => {
    const { container } = renderWithProviders(
      <RadioGroup>
        <RadioGroupItem value="x" id="rx" />
      </RadioGroup>,
    )
    expect(container.querySelector('[data-slot="radio-group"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="radio-group-item"]')).toBeInTheDocument()
  })
})
