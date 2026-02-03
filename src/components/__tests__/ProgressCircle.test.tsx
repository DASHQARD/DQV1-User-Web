import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { ProgressCircle } from '../ProgressCircle/ProgressCircle'

describe('ProgressCircle', () => {
  it('renders progress percentage', () => {
    renderWithProviders(<ProgressCircle currentProgress={50} />)
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('renders 0% when currentProgress is 0', () => {
    renderWithProviders(<ProgressCircle currentProgress={0} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('renders 100% when currentProgress is 100', () => {
    renderWithProviders(<ProgressCircle currentProgress={100} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('renders svg for the circle', () => {
    const { container } = renderWithProviders(<ProgressCircle currentProgress={25} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(container.querySelectorAll('circle')).toHaveLength(2)
  })
})
