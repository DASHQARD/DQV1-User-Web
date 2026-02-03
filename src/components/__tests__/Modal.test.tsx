import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { Modal } from '../Modal/Modal'

describe('Modal', () => {
  it('renders children when open', () => {
    const { getByText } = renderWithProviders(
      <Modal isOpen setIsOpen={() => {}}>
        <p>Modal content</p>
      </Modal>,
    )
    expect(getByText(/modal content/i)).toBeInTheDocument()
  })

  it('renders close button when showClose is true', () => {
    const { getByTestId } = renderWithProviders(
      <Modal isOpen setIsOpen={() => {}} showClose>
        <p>Content</p>
      </Modal>,
    )
    expect(getByTestId('modal-close-btn')).toBeInTheDocument()
  })
})
