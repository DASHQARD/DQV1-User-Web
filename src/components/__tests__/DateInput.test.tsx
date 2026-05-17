import { describe, it, expect, vi } from 'vitest'
import { act } from '@testing-library/react'
import { renderWithProviders, screen } from '@/test/test-utils'
import { DateInput } from '../DateInput/DateInput'

const datePickerProps = vi.hoisted(() => ({ current: {} as Record<string, unknown> }))

vi.mock('react-datepicker', () => ({
  default: (props: Record<string, unknown>) => {
    datePickerProps.current = props
    return (
      <input
        id={props.id as string}
        data-testid="datepicker-input"
        placeholder={props.placeholderText as string}
        disabled={props.disabled as boolean}
        onClick={() => {
          ;(props.onInputClick as () => void)?.()
          ;(props.onCalendarOpen as () => void)?.()
        }}
        onChange={() => (props.onChange as (date: Date) => void)?.(new Date(2000, 1, 15))}
      />
    )
  },
}))

describe('DateInput', () => {
  it('renders label when provided', () => {
    renderWithProviders(<DateInput label="Start date" />)
    expect(screen.getByText('Start date')).toBeInTheDocument()
  })

  it('uses default label when not provided', () => {
    renderWithProviders(<DateInput />)
    expect(screen.getByText('Date Created')).toBeInTheDocument()
  })

  it('renders error message when error is provided', () => {
    renderWithProviders(<DateInput error="Invalid date" />)
    expect(screen.getByText('Invalid date')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    renderWithProviders(<DateInput placeholder="Pick a date" />)
    expect(screen.getByPlaceholderText('Pick a date')).toBeInTheDocument()
  })

  it('renders date picker input', () => {
    const { container } = renderWithProviders(<DateInput id="test-date" />)
    const input = container.querySelector('input')
    expect(input).toBeInTheDocument()
  })

  it('closes the calendar after a date is selected', () => {
    const onChange = vi.fn()
    renderWithProviders(<DateInput onChange={onChange} />)

    expect(datePickerProps.current.open).toBe(false)
    expect(datePickerProps.current.shouldCloseOnSelect).toBe(true)

    act(() => {
      ;(datePickerProps.current.onInputClick as () => void)()
    })
    expect(datePickerProps.current.open).toBe(true)

    act(() => {
      ;(datePickerProps.current.onChange as (date: Date) => void)(new Date(2000, 1, 15))
    })
    expect(onChange).toHaveBeenCalledWith(new Date(2000, 1, 15))
    expect(datePickerProps.current.open).toBe(false)
  })

  it('closes the calendar when a day is clicked in the picker', () => {
    renderWithProviders(<DateInput />)

    act(() => {
      ;(datePickerProps.current.onInputClick as () => void)()
    })
    expect(datePickerProps.current.open).toBe(true)

    act(() => {
      ;(datePickerProps.current.onSelect as () => void)()
    })
    expect(datePickerProps.current.open).toBe(false)
  })
})
